//Documents: https://ulixee.org/docs/cloud/modules/cloud-node#constructor
import { CloudNode } from '@ulixee/cloud';

(async () => {
    const cloudNode = new CloudNode({
        port: 1818,
        cloudType: 'private'
    });
    await cloudNode.listen();
    console.log(`CloudNode started on port ${await cloudNode.port}`);
})().catch(error => {
    console.log('ERROR starting Ulixee CloudNode', error);
    process.exit(1);
});