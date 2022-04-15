const AWS = require("aws-sdk")

console.log(process.argv)

AWS.config.update({
    accessKeyId: process.argv[2],
    secretAccessKey: process.argv[3],
    "region":"us-east-1"
})

const s3Client = new AWS.S3(
    {
        "params":{
            "Bucket":"upload-filebucket",
        }
    });

const dbClient = new AWS.DynamoDB.DocumentClient();

console.log(process.argv)
fileId = Number(process.argv[process.argv.length-1])

async function getItem(){
    let result = await dbClient.get({
        "TableName":"uploadedFiles",
        "Key":{"id":fileId}
    }).promise()

    console.log(result)
    let filename = result.Item.input_file_path.split('/')
    filename = filename[filename.length-1]
    let file = await s3Client.getObject({ Key: filename }).promise()
    file = file.Body.toString() +" : "+ result.Item.input_text
    console.log(file)

    const params = {
        Bucket : "upload-filebucket",
        Key: "OutputFile.txt",
        Body: file
    }
    
    let res =  await s3Client.upload(params).promise()
    console.log('res',res)

    var dBparams = {
        TableName: 'uploadedFiles',
        Item: {
          "id": Date.now(),
          "input_file_path": res["Location"]
        }
      };
      
      let dbResponse = await dbClient.put(dBparams).promise();
      console.log("dbResponse",dbResponse)
}

getItem()