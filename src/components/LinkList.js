import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Link from './Link';

class LinkList extends Component {
    subscribeToNewLinks = () => {
        this.props.feedQuery.subscribeToMore({
            document: FEED_SUBSCRIPTION,
            updateQuery: (prev, { subscriptionData }) => {
                const links = [subscriptionData.data.newLink.node, ...prev.feed.links];
                return { ...prev, feed: { links } };
            },
        });
    };

    subscribeToNewVotes = () => {
        this.props.feedQuery.subscribeToMore({
            document: VOTES_SUBSCRIPTION,
        });
    };

    updateCacheAfterVote = (store, createVote, linkId) => {
        const data = store.readQuery({ query: FEED_QUERY });
        const votedLink = data.feed.links.find(link => link.id === linkId);

        votedLink.votes = createVote.link.votes;
        store.writeQuery({ query: FEED_QUERY, data });
    };

    renderLink = (link, i) => (
        <Link key={link.id} index={i} link={link} updateStoreAfterVote={this.updateCacheAfterVote} />
    );

    componentDidMount() {
        this.subscribeToNewLinks();
        this.subscribeToNewVotes();
    }

    render() {
        const { feedQuery } = this.props;

        if (feedQuery && feedQuery.loading) return <div>Loading</div>;
        if (feedQuery && feedQuery.error) return <div>Error</div>;

        return <div>{feedQuery.feed.links.map(this.renderLink)}</div>;
    }
}

export const FEED_QUERY = gql`
    query FeedQuery {
        feed {
            links {
                id
                createdAt
                url
                description
                postedBy {
                    id
                    name
                }
                votes {
                    id
                    user {
                        id
                    }
                }
            }
        }
    }
`;

const FEED_SUBSCRIPTION = gql`
    subscription {
        newLink {
            node {
                id
                createdAt
                url
                description
                postedBy {
                    id
                    name
                }
                votes {
                    id
                    user {
                        id
                    }
                }
            }
        }
    }
`;

const VOTES_SUBSCRIPTION = gql`
    subscription {
        newVote {
            node {
                id
                link {
                    id
                    url
                    description
                    createdAt
                    postedBy {
                        id
                        name
                    }
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
    }
`;

export default graphql(FEED_QUERY, { name: 'feedQuery' })(LinkList);
