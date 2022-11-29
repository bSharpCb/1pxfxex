const axios = require('axios');

// Utility for timestamp formatting
function _ReadableTimestamp(timestamp){
  let time = new Date(timestamp * 1000);
  return JSON.stringify(time).split('T')[0];
}

const axios_instance = axios.create({
    baseURL: 'http://localhost:3535',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Function to request access token for API Authorization
// You must replace the 'Authorization' field with the Base 64 Encoded KeyID + Secret combination associated with your API key
async function _GenerateAccessToken(){
    const response = await axios({
        url: 'https://ui.1plusx.io/api/auth/token',
        method: 'post',
        data : 'grant_type=client_credentials',
        headers: { 
          'Authorization': 'Basic ', 
         'Content-Type': 'application/x-www-form-urlencoded', 
          'Cookie': 'AWSALB=A2pXM9BASVwvqu1mxTqY/mxEr3SiIMrUcNTjTjbtWLo8SxlBmD2tbESA3eQfMf+rUNJXbVDZFtuVGv2c7IXKF0omPyF1I1VIh2rZbiN4io+cGXcju0pkMryS6i3u; AWSALBCORS=A2pXM9BASVwvqu1mxTqY/mxEr3SiIMrUcNTjTjbtWLo8SxlBmD2tbESA3eQfMf+rUNJXbVDZFtuVGv2c7IXKF0omPyF1I1VIh2rZbiN4io+cGXcju0pkMryS6i3u'
         }
    });
    return response.data.access_token;
}
// This function will provide a list of all audiences from the FOX UI
// For each audience, it will display the name, date created, date last modified, and any associated tags
async function _RequestAllAudiences(){
  const token = await _GenerateAccessToken();
  var config = {
    method: 'get',
    url: 'https://ui.1plusx.io/api/platform/accounts/fox/audiences',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json', 
      'Cookie': 'AWSALB=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6; AWSALBCORS=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6'
    }
  };
  
  const response = await axios(config)
  .then(function (response) {
    let audiences = [];
    for (let i in response.data) {
      let some_aud = response.data[i];
      audiences.push(some_aud);
     audiences.push({
          "name": some_aud.name,
          "date_created": _ReadableTimestamp(some_aud.created),
          "date_modified": _ReadableTimestamp(some_aud.last_modified),
          "labels": some_aud.tags
      })
    }
    console.log(audiences);
  })
  .catch(function (error) {
    console.log(error);
  });
}

// This function will request all attributes registered for FOX so that you can find the ID associated with each
// The attribute ID is needed for building queries that filter for specific attributes
async function _RequestAllAttributes(){
  const token = await _GenerateAccessToken();
  const config = {
    method: 'get',
    url: 'https://ui.1plusx.io/api/platform/accounts/fox/profiles/attributes',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json', 
      'Cookie': 'AWSALB=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6; AWSALBCORS=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6'
    }
  };
  
  const response = await axios(config)
  .then(function (response) {
    let formatAttributes = [];
    for(let i in response.data){
      formatAttributes.push({
        "name": response.data[i].name,
        "id": response.data[i].id,
        "type": response.data[i].type
      })
    }
    console.debug(formatAttributes);
  })
  .catch(function (error) {
    console.log(error);
  });
}



// This query will search for profiles with minimum 1 Video Content Started event in the last 90 days, on either iOS or Android
async function _Query_iOS_Android_90_days(){
    const token = await _GenerateAccessToken();
    const data = JSON.stringify({
      "filter": [
        {
          "or": [
              {
                  "attributeId": "FoxNews.appplatform",
                  "interaction": "Video Content Started",
                  "item": "android",
                  "minFreq": 1,
                  "recency": 90
              },
              {
                  "attributeId": "FoxNews.appplatform",
                  "interaction": "Video Content Started",
                  "item": "ios",
                  "minFreq": 1,
                  "recency": 90
              }
          ]
      }
      ],
      "select": []
    });
    const config = {
      method: 'post',
      url: 'https://ui.1plusx.io/api/platform/accounts/fox/profiles/query',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json', 
        'Cookie': 'AWSALB=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6; AWSALBCORS=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6'
      },
      data : data
    };
    const response = await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  }


// This query will search for profiles with events on either Fox Nation or Fox Sports, 
// which include a minimum of 1 Video Content Started event in the last 7 days, on the Roku platform
async function _Query_Nation_Sports_Roku_7_days(){
  const token = await _GenerateAccessToken();
  const data = JSON.stringify({
    "filter": [
      {
        "or": [
            {
                "attributeId": "FoxNation.appplatform",
                "interaction": "Video Content Started",
                "item": "roku",
                "minFreq": 1,
                "recency": 7
            },
            {
                "attributeId": "FoxSports.appplatform",
                "interaction": "Video Content Started",
                "item": "roku",
                "minFreq": 1,
                "recency": 7
            }
        ]
    }
    ],
    "select": []
  });
    
    const config = {
      method: 'post',
      url: 'https://ui.1plusx.io/api/platform/accounts/fox/profiles/query',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json', 
        'Cookie': 'AWSALB=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6; AWSALBCORS=l5eAgtcDmRuftYZR9gC0WWBh3FD6J8zVWmFa5UIvYiHM3yK8nydyZNDLOZISCnu8Yv58fASF9Ej37/X2waT9OV1V8RYpQlEybjKXbjRAn5iruvKxf7YfBeMHKBb6'
      },
      data : data
    };
    
    const response = await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  }


/**
 * Uncomment whichever of these queries you would like to run, and the output will appear in the console
 **/  


// This query will search for profiles with minimum 1 Video Content Started event in the last 90 days, on either iOS or Android
  _Query_iOS_Android_90_days()

// This query will search for profiles with events on either Fox Nation or Fox Sports, 
// which include a minimum of 1 Video Content Started event in the last 7 days, on the Roku platform
  //_Query_Nation_Sports_Roku_7_days()


// This query will return a list of FOX attributes including the name, ID, and type of each attribute
// This is helpful if you want to identify the ID of a given attribute, so it can be used in further queries
  //_RequestAllAttributes();

// This function will provide a list of all audiences from the FOX UI
// For each audience, it will display the name, date created, date last modified, and any associated tags
  //_RequestAllAudiences()

