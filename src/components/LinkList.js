import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';
import Link from './Link';

class LinkList extends Component {
    componentDidMount() {
        this.subscribeToNewLinks();
        this.subscribeToNewVotes();
    }

    // subscriptions

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
        const variables = {
            page: this.currentPage,
            skip: this.isNewPage ? (this.currentPage - 1) * LINKS_PER_PAGE : 0,
            first: this.isNewPage ? LINKS_PER_PAGE : 100,
            orderBy: this.isNewPage ? 'createdAt_DESC' : null,
        };
        const data = store.readQuery({ query: FEED_QUERY, variables });
        const votedLink = data.feed.links.find(link => link.id === linkId);

        votedLink.votes = createVote.link.votes;
        store.writeQuery({ query: FEED_QUERY, data });
    };

    // link handling

    get isNewPage() {
        // is /new, not /top
        return this.props.location.pathname.includes('new');
    }

    get linksToRender() {
        const { feed } = this.props.feedQuery;
        return this.isNewPage ? feed.links : feed.links.slice().sort((a, b) => a.votes.length - b.votes.length);
    }

    // pagination
    get currentPage() {
        return parseInt(this.props.match.params.page, 10);
    }

    nextPage = () => {
        if (this.currentPage <= this.props.feedQuery.feed.count / LINKS_PER_PAGE) {
            this.props.history.push(`/new/${this.currentPage + 1}`);
        }
    };

    prevPage = () => {
        if (this.currentPage > 1) {
            this.props.history.push(`/new/${this.currentPage - 1}`);
        }
    };

    // rendering

    get links() {
        return (
            <div>
                {this.linksToRender.map((link, i) => (
                    <Link key={link.id} index={i} link={link} updateStoreAfterVote={this.updateCacheAfterVote} />
                ))}
            </div>
        );
    }

    get pagination() {
        if (!this.isNewPage) return null;

        return (
            <div className="flex ml4 mv3 gray">
                <div className="pointer mr2" onClick={() => this.prevPage()}>
                    Previous
                </div>
                <div className="pointer" onClick={() => this.nextPage()}>
                    Next
                </div>
            </div>
        );
    }

    render() {
        const { feedQuery } = this.props;

        if (feedQuery && feedQuery.loading) return <div>Loading</div>;
        if (feedQuery && feedQuery.error) return <div>Error</div>;

        // const page = parseInt(this.props.match.params.page, 10);

        return (
            <div>
                {this.links}
                {this.pagination}
            </div>
        );
    }
}

export const FEED_QUERY = gql`
    query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
        feed(first: $first, skip: $skip, orderBy: $orderBy) {
            count
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
            count
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

export default graphql(FEED_QUERY, {
    name: 'feedQuery',
    options: ownProps => {
        const page = parseInt(ownProps.match.params.page, 10);
        const isNewPage = ownProps.location.pathname.includes('new');
        const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
        const first = isNewPage ? LINKS_PER_PAGE : 100;
        const orderBy = isNewPage ? 'createdAt_DESC' : null;
        return {
            variables: { first, skip, orderBy },
        };
    },
})(LinkList);
