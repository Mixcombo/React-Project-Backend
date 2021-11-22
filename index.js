const express = require("express");
const cors = require("cors");
const corsOptions ={ origin:'*', credentials:true, }
const app = express();
const PORT = process.env.PORT || 8000 ;
const fs = require('fs');
var path = require('path');
const csv = require('csv-parser')
app.use(cors(corsOptions))

  make_dir = async(pathname, origin) => {

    var key = await new Promise((resolve, reject) => {
        fs.readdir(pathname, (err, files) => {
            resolve(files)
        })
    })
    var tmp_arr = [];
    for(let i=0 ;i<key.length;i++){
        if (!key[i].includes('.dcm') && !key[i].includes('.csv')){
            var obj = {};
            obj['label'] = key[i];
            var tmp_key = origin + '-' + i;
            if(origin === ''){
                tmp_key =  i.toString();
            }
            obj[`key`] = tmp_key
            var children = await make_dir(pathname + '/' + key[i], tmp_key)
            // console.log(children);
            obj[`nodes`] = children
            tmp_arr.push(obj)
        }
        else{
            var obj = {};
            obj[`label`] = key[i];
            obj[`key`] = origin + '-' + i
            obj[`isOpen`] = false;
            obj[`path`] = pathname + '/' + key[i];
            tmp_arr.push(obj);
        }
    }
    return tmp_arr
  }

  app.get('/test',(req,res)=>{
    make_dir('projectdata1','').then((e)=>{
    res.send(e);
    // console.log(e);
    })
  });

  app.get('/dcm/*', function(req, res){
    var origin = req.params;
    // console.log(`D:/My Games/my-app-backend/projectdata1/${origin[0]}`);
    res.download(`D:/My Games/my-app-backend/projectdata1/${origin[0]}`);
  })

  app.get('/downloadcsv/*', function(req, res){
    var origin = req.params;
    res.download(`D:/My Games/my-app-backend/projectdata1/csv/${origin[0]}`) ;
  });

  app.get('/csv/*',async function(req, res){
    var origin = req.params;
    const results = [];
    fs.createReadStream(`D:/My Games/my-app-backend/projectdata1/csv/${origin[0]}`)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      arry = [] ;
      for(let i=0 ; i<results.length ; i++){
        var obj = {};
        obj = results[i]
        obj[`key`] = `${i}`;
        arry.push(obj);
      }
      res.send(arry)
    });
  });

app.listen(PORT, ()=> console.log(`server is ${PORT}`));