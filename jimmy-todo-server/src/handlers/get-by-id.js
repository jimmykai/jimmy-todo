const tableName = process.env.TODOS;

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function getById(id) {
  try {
    const params = {
      TableName: tableName,
      Key: { id: id },
    };
    const command = new GetCommand(params);
    const data = await ddbDocClient.send(command);
    console.log("getById: \n", data);
    const item = data.Item;
    return item;
  } catch (error) {
    throw new Error(error);
  }
}

exports.getByIdHandler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      throw new Error(
        `getMethod only accept GET method, you tried: ${event.httpMethod}`
      );
    }

    console.info("received:", event);

    const id = event.pathParameters.id;

    const item = await getById(id);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, item }),
    };

    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};
