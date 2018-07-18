import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';

class Link extends Component {
    voteForLink = async () => {
        const linkId = this.props.link.id;

        await this.props.voteMutation({
            variables: { linkId },
            update: (store, { data: { vote } }) => {
                this.props.updateStoreAfterVote(store, vote, linkId);
            },
        });
    };

    render() {
        const authToken = localStorage.getItem(AUTH_TOKEN);

        const { createdAt, description, postedBy, url, votes } = this.props.link;

        return (
            <div className="flex mt2 items-start">
                <div className="flex items-center">
                    <span className="gray">{this.props.index + 1}.</span>
                    {authToken && (
                        <div className="ml1 gray f11" onClick={() => this.voteForLink()}>
                            ▲
                        </div>
                    )}
                </div>
                <div className="ml1">
                    <div>
                        {description} ({url})
                    </div>
                    <div className="f6 lh-copy gray">
                        {votes.length} votes | by {postedBy ? postedBy.name : 'Unknown'}{' '}
                        {timeDifferenceForDate(createdAt)}
                    </div>
                </div>
            </div>
        );
    }
}

const VOTE_MUTATION = gql`
    mutation VoteMutation($linkId: ID!) {
        vote(linkId: $linkId) {
            id
            link {
                votes {
                    id
                    user {
                        id
                    }
                }
            }
            user {
                id
            }
        }
    }
`;

export default graphql(VOTE_MUTATION, { name: 'voteMutation' })(Link);
