import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';
import { FEED_QUERY } from './LinkList';
import Button from './Button';

class CreateLink extends Component {
    state = {
        description: '',
        url: '',
    };

    createLink = async () => {
        const { description, url } = this.state;

        await this.props.postMutation({
            variables: { description, url },
            update: (store, { data: { post } }) => {
                const variables = { first: LINKS_PER_PAGE, skip: 0, orderBy: 'createdAt_DESC' };
                const data = store.readQuery({ query: FEED_QUERY, variables });
                data.feed.links.splice(0, 0, post);
                data.feed.links.pop();
                store.writeQuery({ query: FEED_QUERY, data, variables });
            },
        });

        this.props.history.push('/new/1');
    };

    render() {
        return (
            <div>
                <div className="flex flex-column mt3">
                    <input
                        value={this.state.description}
                        onChange={e => this.setState({ description: e.target.value })}
                        type="text"
                        placeholder="A description for the link"
                    />
                    <input
                        value={this.state.url}
                        onChange={e => this.setState({ url: e.target.value })}
                        type="text"
                        placeholder="The URL for the link"
                    />
                </div>
                <Button onClick={() => this.createLink()}>Submit</Button>
            </div>
        );
    }
}

const POST_MUTATION = gql`
    mutation PostMutation($description: String!, $url: String!) {
        post(description: $description, url: $url) {
            id
            createdAt
            url
            description
        }
    }
`;

export default graphql(POST_MUTATION, { name: 'postMutation' })(CreateLink);
