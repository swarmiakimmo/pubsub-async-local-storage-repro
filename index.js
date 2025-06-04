import { Message, PubSub } from '@google-cloud/pubsub'
import { AsyncLocalStorage } from 'async_hooks'
import { randomUUID } from 'crypto'

// Fill these and make sure you have e.g. GOOGLE_APPLICATION_CREDENTIALS set up
const projectId = '<project-id>'
const topicName = '<topicName>'
const subscriptionName = '<subscriptionName>'

const als = new AsyncLocalStorage()

async function main() {
  const pubsub = new PubSub({
    projectId,
  })

  // Publish 50 messages to the topic
  const topic = pubsub.topic(topicName)
  for (let i = 0; i < 50; i++) {
    await topic.publishMessage({
      json: {
        messageId: randomUUID(),
      },
    })
  }
  console.log('Published test messages. Starting to process ...')

  const sub = pubsub.subscription(subscriptionName, {
    flowControl: {
      maxMessages: 10, // THIS IS IMPORTANT, there needs to be concurrent message processing
      allowExcessMessages: false,
    },
  })

  sub.on('message', message => {
    console.log('Received message:', message.id, message.data.toString('utf8'))
    const prevOperationId = als.getStore()?.get('operationId')
    if (prevOperationId) {
      // THIS SHOULD NOT HAPPEN!
      console.warn(
        `ERROR: operation context already has an ID: ${prevOperationId}`,
      )
    }

    handleMessage(message)
  })

  sub.on('error', (err) => console.error(`Error: ${err}`))
  sub.on('close', () => {
    console.log('Subscription closed')
  })
}

async function handleMessage(message) {
  const operationId = randomUUID()
  const alsStore = new Map([['operationId', operationId]])
  await als.run(alsStore, async () => {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate async work

    // Calling .ack() inside the ALS .run() callback seems to cause the issue
    message.ack()

    console.log('Finished processing operation:', operationId)
  })
}

void main().catch(err => {
  console.error('Error in main:', err)
  console.error(err.stack)
})
