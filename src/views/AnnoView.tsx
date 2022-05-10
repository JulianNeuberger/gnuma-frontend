import React from 'react';

import {Button, Card, Table} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {Project} from '../state/anno/reducer';

import {ProjectContext} from '../components/AnnoContextProvider/ProjectContextProvider'

export default function AnnoView(){
	const context = React.useContext(ProjectContext);

	const projects = Object.values(context.state.elements)

	return (
		<div key={'anno-view'}>
			<Card
				title = {'Annotation projects'}
				extra = {
					<Button
						type = {'primary'}
						icon = {<PlusOutlined/>}
						onClick = {() => {
							context.onCreate({
								name: `Testproject`
							});
						}}
					>
						New 
					</Button>
				}
			>
				<Table
					loading = {context.state.loading}
					dataSource = {projects}
					columns = {[
						{
							title: 'ID',
							dataIndex: 'id'
						},
						{
							title: 'Name',
							dataIndex: 'name'
						}
					]}
				/>
			</Card>
		</div>
	);
}