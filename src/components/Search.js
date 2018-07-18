import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import Button from './Button';
import Link from './Link';

class Search extends Component {
    state = {
        links: [],
        filter: '',
    };

    executeSearch = async () => {
        const { data } = await this.props.client.query({
            query: FEED_SEARCH_QUERY,
            variables: { filter: this.state.filter },
        });

        this.setState({ links: data.feed.links });
    };

    render() {
        return (
            <div>
                <div>
                    Search
                    <input type="text" onChange={e => this.setState({ filter: e.target.value })} />
                    <Button onClick={() => this.executeSearch()}>OK</Button>
                </div>
                {this.state.links.map((link, i) => <Link key={link.id} link={link} index={i} />)}
            </div>
        );
    }
}

export const FEED_SEARCH_QUERY = gql`
    query FeedSearchQuery($filter: String!) {
        feed(filter: $filter) {
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

export default withApollo(Search);
