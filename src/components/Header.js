import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import { AUTH_TOKEN } from '../constants';

const Divider = () => <div className="ml1">|</div>;

const NavItem = props => <Link {...props} className="ml1 no-underline black" />;

class Header extends Component {
    render() {
        const authToken = localStorage.getItem(AUTH_TOKEN);

        return (
            <div className="flex pa1 justify-between nowrap orange">
                <div className="flex flex-fixed black">
                    <div className="fw7 mr1">Slacker News</div>
                    <NavItem to="/">new</NavItem>
                    <Divider />
                    <NavItem to="/top">top</NavItem>
                    <Divider />
                    <NavItem to="/search">search</NavItem>
                    {authToken && (
                        <div className="flex">
                            <Divider />
                            <NavItem to="/create">submit</NavItem>
                        </div>
                    )}
                </div>
                <div className="flex flex-fixed">
                    {authToken ? (
                        <div
                            className="ml1 pointer black"
                            onClick={() => {
                                localStorage.removeItem(AUTH_TOKEN);
                                this.props.history.push(`/`);
                            }}
                        >
                            logout
                        </div>
                    ) : (
                        <NavItem to="/login">login</NavItem>
                    )}
                </div>
            </div>
        );
    }
}

export default withRouter(Header);
