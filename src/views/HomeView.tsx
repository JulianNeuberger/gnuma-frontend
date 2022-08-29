import {Card, Image, Typography} from 'antd';

export default function HomeView() {
    return (
        <div key='home-view'>
            <Card
                title={
                    <>
                        <Typography.Title>GNUMA</Typography.Title>
                        <Typography.Text>General Natural Language Understanding Microservice Architecture</Typography.Text>
                    </>
                }
            >
                <Image
                    wrapperStyle={{
                        width: '50%',
                        marginRight: '25%',
                        marginLeft: '25%'
                    }}
                    src={'https://upload.wikimedia.org/wikipedia/commons/d/dc/Gnu_head.jpg'}
                />
            </Card>
        </div>
    );
}