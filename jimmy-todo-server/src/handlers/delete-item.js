const tableName = process.env.TODOS;

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function deleteItem(id) {
  try {
    const params = {
      TableName: tableName,
      Key: { id: id },
    };
    const command = new DeleteCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

exports.deleteItemHandler = async (event) => {
  try {
    if (event.httpMethod !== "DELETE") {
      throw new Error(
        `deleteMethod only accepts DELETE method, you tried: ${event.httpMethod} method.`
      );
    }

    console.info("received:", event);

    const id = event.pathParameters.id;

    const result = await deleteItem(id);

    console.log("result: \n", result);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true }),
    };

    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};
