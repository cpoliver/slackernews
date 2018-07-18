import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Link from './Link';

class LinkList extends Component {
    updateCacheAfterVote = (store, createVote, linkId) => {
        const data = store.readQuery({ query: FEED_QUERY });
        const votedLink = data.feed.links.find(link => link.id === linkId);

        votedLink.votes = createVote.link.votes;
        store.writeQuery({ query: FEED_QUERY, data });
    };

    renderLink = (link, i) => (
        <Link key={link.id} index={i} link={link} updateStoreAfterVote={this.updateCacheAfterVote} />
    );

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

export default graphql(FEED_QUERY, { name: 'feedQuery' })(LinkList);
