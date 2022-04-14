const tableName = process.env.TODOS;

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function getAllItems() {
  try {
    const params = {
      TableName: tableName,
    };
    const command = new ScanCommand(params);
    const data = await ddbDocClient.send(command);
    console.log("getAllItemsData: \n", data);
    const items = data.Items;
    return items;
  } catch (error) {
    throw new Error(error);
  }
}

async function getBySearchTerm(searchTerm) {
  try {
    const params = {
      TableName: tableName,
      FilterExpression: "contains(todo, :s)",
      ExpressionAttributeValues: {
        ":s": searchTerm,
      },
    };
    const command = new ScanCommand(params);
    const data = await ddbDocClient.send(command);
    console.log("getBySearchTerm \n", data);
    const items = data.Items;
    return items;
  } catch (error) {
    throw new Error(error);
  }
}

exports.getAllItemsHandler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      throw new Error(
        `getAllItems only accept GET method, you tried: ${event.httpMethod}`
      );
    }
    console.info("received:", event);

    let items = {};

    if (event.queryStringParameters && event.queryStringParameters.searchTerm) {
      items = await getBySearchTerm(event.queryStringParameters.searchTerm);
    } else {
      items = await getAllItems();
    }

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, items }),
    };

    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};
