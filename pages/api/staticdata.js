import path from 'path';
import { promises as fs } from 'fs';

export default async function handler(req, res) {
  // console.log('res', res.data);
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), 'media');
  //Read the json data file data.json
  const fileContents = await fs.readFile(
    jsonDirectory + '/staticdata.json',
    'utf8',
  );
  //Return the content of the data file in json format
  res.status(200).json(fileContents);
}
