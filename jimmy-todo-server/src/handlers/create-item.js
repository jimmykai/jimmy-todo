const tableName = process.env.TODOS;

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { DateTime } = require("luxon");

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function createItem(todo) {
  try {
    const timeOfNow = DateTime.now().toISO();
    const params = {
      TableName: tableName,
      Item: {
        id: uuidv4(),
        todo: todo,
        done: false,
        createdAt: timeOfNow,
        updatedAt: timeOfNow,
      },
    };
    const command = new PutCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

exports.createItemHandler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      throw new Error(
        `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
      );
    }

    console.info("received:", event);

    const body = JSON.parse(event.body);

    if (typeof body.todo !== "string") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: "Validation Failed! Couldn't create the todo item.",
        }),
      };
    }

    const todo = body.todo;

    const result = await createItem(todo);

    console.log("result: \n", result);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, todo }),
    };

    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};
