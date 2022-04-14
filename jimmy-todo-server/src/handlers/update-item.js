const tableName = process.env.TODOS;

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const { DateTime } = require("luxon");

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function updateItem(id, todo, done) {
  try {
    const timeOfNow = DateTime.now().toISO();
    const params = {
      TableName: tableName,
      Key: { id: id },
      UpdateExpression: "set todo = :t, updatedAt = :u, done = :d",
      ExpressionAttributeValues: {
        ":t": todo,
        ":u": timeOfNow,
        ":d": (done = done ? true : false),
      },
    };
    const command = new UpdateCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

exports.updateItemHandler = async (event) => {
  try {
    if (event.httpMethod !== "PATCH") {
      throw new Error(
        `patchMethod only accepts PATCH method, you tried: ${event.httpMethod} method.`
      );
    }

    console.info("received:", event);

    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);

    if (
      typeof id !== "string" ||
      typeof body.todo !== "string" ||
      typeof body.done !== "boolean"
    ) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: "Validation Failed! Couldn't update the todo item.",
        }),
      };
    }

    const todo = body.todo;
    const done = body.done;

    const result = await updateItem(id, todo, done);

    console.log("result: \n", result);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, id, todo }),
    };

    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};
