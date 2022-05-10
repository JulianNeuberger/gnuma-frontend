import React from 'react';

import {Link, Route, Switch, useLocation} from 'react-router-dom';

import {CSSTransition, TransitionGroup} from 'react-transition-group';

import {Layout, Menu} from 'antd';
import {CopyOutlined, FileTextOutlined, HomeOutlined, SettingOutlined, FormOutlined} from '@ant-design/icons';
import {volcano as color} from '@ant-design/colors';

import DatasetsView from './views/DatasetsView';
import DatasetDetailsView from './views/DatasetDetailsView';
import DocumentsView from './views/DocumentsView';
import DocumentDetailsView from './views/DocumentDetailsView';
import AnnoView from './views/AnnoView'

import 'antd/dist/antd.css';
import './App.css';
import HomeView from './views/HomeView';
import DatasetsContextProvider from './components/DatasetsContextProvider/DatasetsContextProvider';
import DocumentsContextProvider from './components/DocumentsContextProvider/DocumentsContextProvider';
import ProjectContextProvider from './components/AnnoContextProvider/ProjectContextProvider'
import LogsContextProvider from './components/LogsContextProvider/LogsContextProvider';
import DebugConfigView from './views/DebugConfigView';


function App() {
    const {Header, Sider, Content} = Layout;

    const location = useLocation();

    const renderMenu = () => {
        return (
            <Menu>
                <Menu.Item
                    key={'/'}
                    icon={<HomeOutlined/>}
                >
                    <Link to='/'>Home</Link>
                </Menu.Item>
                <Menu.Item
                    key={'/documents/'}
                    icon={<FileTextOutlined/>}
                >
                    <Link to='/documents/'>Documents</Link>
                </Menu.Item>
                <Menu.Item
                    key={'/datasets/'}
                    icon={<CopyOutlined/>}
                >
                    <Link to='/datasets/'>Datasets</Link>
                </Menu.Item>

                <Menu.Item
                    key={'/annotation/'}
                    icon={<FormOutlined/>}
                >
                    <Link to='/annotation/'>Annotation</Link>
                </Menu.Item>

                <Menu.Item
                    key={'/debug/configuration/'}
                    icon={<SettingOutlined/>}
                >
                    <Link to='/debug/configuration/'>Configuration Tests</Link>
                </Menu.Item>
            </Menu>
        );
    }

    const renderContent = () => {
        return (
            <TransitionGroup>
                <CSSTransition
                    key={location.key}
                    classNames='fade'
                    timeout={300}
                >
                    <Switch
                        key={location.key}
                        location={location}
                    >
                        <Route path='/datasets/:id/'>
                            <DatasetDetailsView key='dataset-details-view'/>
                        </Route>
                        <Route exact path='/datasets/'>
                            <DatasetsView key='datasets-view'/>
                        </Route>

                        <Route exact path='/documents/:id/'>
                            <DocumentDetailsView key='document-details'/>
                        </Route>
                        <Route exact path='/documents/'>
                            <DocumentsView key='documents-view'/>
                        </Route>

                        <Route exact path='/annotation'>
                            <AnnoView key='anno_view'/>
                        </Route>

                        <Route exact path='/debug/configuration/'>
                            <DebugConfigView key='debug-configuration-view'/>
                        </Route>

                        <Route exact path='/'>
                            <HomeView key='home-view'/>
                        </Route>
                    </Switch>
                </CSSTransition>
            </TransitionGroup>
        );
    }

    return (
        <DatasetsContextProvider>
            <DocumentsContextProvider>
                <ProjectContextProvider>
                    <LogsContextProvider>
                        <Layout style={{minHeight: '100vh'}}>
                            <Header style={{color: color.primary, fontSize: '1.25em'}}>
                                GNUMA
                            </Header>
                            <Layout>
                                <Sider>
                                    {renderMenu()}
                                </Sider>
                                <Content
                                    className={'gnuma-view'}
                                >
                                    {renderContent()}
                                </Content>
                            </Layout>
                        </Layout>
                    </LogsContextProvider>
                </ProjectContextProvider>
            </DocumentsContextProvider>
        </DatasetsContextProvider>
    );
}

export default App;
