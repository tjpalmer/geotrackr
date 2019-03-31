import {load} from 'cheerio';
import {readFileSync} from 'fs';

let html = readFileSync('./places/beijing/beijing.html');
let doc = load(html);
console.log(doc);
