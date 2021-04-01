const express = require('express');
const formidable = require('formidable');
const fs = require('fs'); 
const vision = require('@google-cloud/vision');
const dotenv = require('dotenv').config();
const app = express();
const client = new vision.ImageAnnotatorClient();

app.use('/vision/uploads', express.static('uploads'));

app.get('/vision', (req, res) => {
  res.send(`
    <h2>Upload an Image</h2>
    <form action="/vision/upload" enctype="multipart/form-data" method="post">
      <div>File: <input type="file" name="imageFile" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

app.post('/vision/upload', (req, res, next) => {
  const form = formidable();
  form.parse(req, (err, fields, upload) => {
    if (err) {
      next(err);
      return;
    }
      let src = upload.imageFile.path;
      let dest = './uploads/'+upload.imageFile.name;
      res.write(`<html><body>`+
		`<style>body{font-family: sans-serif;}</style>`+
		`<h2>` + upload.imageFile.name + `</h2>` +
           	`<img style="height: 50vh" src="` + dest + `">`
		);
      fs.rename(src, dest, function (err) {
          if (err) throw err;
	  annotate(dest, res);
      });
  });
});


async function annotate(filename, res) {
  const [result] = await client.labelDetection(filename);
  const labels = result.labelAnnotations;
  labels.forEach(label => res.write(`<p>`+label.description+`</p>`));
  res.write('</body></html>');
  res.end();
}

app.listen(3001, () => {  console.log('Server listening on http://localhost:3001 ...');  });
