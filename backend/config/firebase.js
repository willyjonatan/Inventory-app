const admin = require('firebase-admin');

// Hardcode sementara untuk testing
const serviceAccount = {
    type: 'service_account',
    project_id: 'inventory-app-e9d00',
    private_key_id: 'c4feb1d52658bc5e48ad255b06fd7ed3ae7e2c95',
    private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7QjPSYHl7gGfF
wKelt6jfBSK4q9GPTw6FXJuvx2ZPCvzMDKsET/nhEkUgoEToToP8qm6H01BcV+Yg
lPgvlAf6dWcwL+XCMH1arXtWDtNcKVo41g1G1EzU3Pxmkyi79M0tyNIFLsDUIHQf
iQOuUr5CAk+WiZgQEtzB4B25bfl4YruvbBuJadZQtbmBNJOqEg/Ei/HB5FLQg8Ut
rKU6zf3H1fx0McrdCsBgfBvzPIeyl+eL0oqjwH1ewWHH9lL8eaIth6XS+2oQ2rWW
twz+c17kHugoinm+z9pOScCB319nP5GEtd3kkF1BXS1T/QT6+vtmeLJcSYmdJD9e
FPoyocKzAgMBAAECggEAEp+087lwm53btElC4zJu8y9ZkrBT+ULNmOnq+gKE5Fud
ZNXltFoX6hCdG2+VKt2UNu7ka1HS7jw3wQnP3TuFx50hlCNPYI7eCMS0PYzf7IyY
UorHa0H2Gj2YRMNiC79/IIyWhrltqCtKIVDJMu87yOjd7YTlwMN/fTDDBAwyAYz0
mayGKgoYQInWpwYFdk3lw+5tDmcY9nobf6oijJNg3gTRvf1/BFbwwfmWRxx1yZ+c
YMJKatP/0Cdhy/4uITP3DnKmjqG95QA2KMXueGnbsFQRhzYvjaYsPQVR/TSyIysb
VZROnLRJeW3rjaC94EuQSwQbpPaGc9ZwikIgPzi2MQKBgQDs78h0ohuVdvGI+di4
c+rwwE7fUVdh83itLVlwLjqimNZXBCGfalOyy/jbpLBoVPxZWvflfergYaQY+YOH
yGIeSgvHmYBUjdqteA6Mhl7Qz88qhT+hj5XJRG4Sh/Qwf2M3CJpqXW2DMZMWmQgZ
HpWzi52KKhSgH2hS/PIKnyxdLwKBgQDKUzGZ652oW1+En67x5nKvZrwhQN0Wqd04
c7tbv0iYyrNNqeg51FtC9ZbM9ys7pBeWqO7xnPsiwZqTiJ3p8QFGXczk2d8jYt5J
l9wj19JpEvxTEkwSPZzPesEW5pFspxXVZCm9e94wyzzQcbwl3rIUxgYtasHbVmxV
7O6t2pa5vQKBgQDrrMbTXLvbO+icuwha0NKMjnzlnN8ySx9qAoXIE/O28BejjjRz
gSun2UO8FmByJrarmtShrVIHxpeXT/kJAsS2JCj7bTA86qzth1HRbYa6ZTpHrSrR
5SS0giCKxjiaVNu3ThNqYWwg5xrLi4SGl+mIIgOd/qVtcFAw2/FVp2ZVeQKBgQCm
cIP4ZEzBB9HvD1Hiq7oisvgGvw5hq4FSBFrX4eb90ppoRGLG1/vvfIr+uEJ3gMjq
5rQSTRqHgA8CWTvXDK0IzvdUOCsJODc3AVdWoR/10mmCiSXNR6QtRoV7qldts5IR
hqGTwEeLilXQABBQcv+6eSDx0cYCAvmCQjQjDxQ5XQKBgBzy6S9qdGkjpk6OR9Yb
X1fT6mQ3Sqqw9eP4kZD7JCjudN78EWQEQRxpaUBC06boYj641dFAf028oPrd79ea
7npDFWm/XdhrrJhTZEXIvkkCU8QchL8KDZ8JKd8fb/Pfz/pSVzZ9OlFNWbLR1+XZ
EDfgHJ+rvUxWypwDFvGRRVZZ
-----END PRIVATE KEY-----
`,
    client_email: 'firebase-adminsdk-fbsvc@inventory-app-e9d00.iam.gserviceaccount.com',
    client_id: '116812885812348817377',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40inventory-app-e9d00.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com'
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };