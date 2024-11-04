import { Client } from '@notionhq/client'
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const run = async () => {
  const response = await notion.search({
    // sort: { timestamp: 'last_edited_time', direction: 'ascending' },
    // query: 'Reading',
    filter: { property: 'object', value: 'database' },
  })
  for (const result of response.results) {
    console.log(result)
    console.log((result as DatabaseObjectResponse).title[0])
  }
}

run()
