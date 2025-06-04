# pubsub-async-local-storage-repro


Steps to reproduce:

1. Edit `projectId`, `topicName`, and `subscriptionName` in index.js. They need to refer to a GCP project you have access to, an existing topic name and subscription name.
1. `npm install`
1. Run the example script: `GOOGLE_APPLICATION_CREDENTIALS=/Users/kimmo/.gcloud/<INSERT_YOUR_JSON_KEY_PATH> node index.js`


Once you run this, these log lines appear:

```
ERROR: operation context already has an ID: 412ebf00-3e8f-4ab1-8ae5-f001ebb97229
```

which means the code entered a path it should not enter!