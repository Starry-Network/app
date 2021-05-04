import ipfsClient from 'ipfs-http-client'

const ipfs = ipfsClient({ host: process.env.REACT_APP_IPFS_HOST, port: process.env.REACT_APP_IPFS_PORT, protocol: process.env.REACT_APP_IPFS_PROTOCOL });

export default ipfs;
