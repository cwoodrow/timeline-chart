"use strict";
const express = require('express');
const expressHandlebars = require('express-handlebars');
const unirest = require('unirest');
const path = require("path");
const htmlToText = require('html-to-text');


const app = express();


app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', (req, res) => {
  const query = req.query['q'];

  if (!query) {
    res.sendFile(path.join(__dirname + '/public/home.html'));
  } else {
    const colorsTabFromParameter = req.query['colors'] ? req.query['colors'].split("|") : undefined;
    let colors = undefined;
    if (colorsTabFromParameter) {
      colors = "[" + colorsTabFromParameter.map(color => {
        return "'#" + color + "'"
      }).join(",") + "]";
    }

    unirest.get(createQueryURL(query))
      .end(response => {
        const events = [];
        const entities = response.body.entities;
        const keys = Object.keys(entities);

        const split = query.split('|');

        keys.forEach((key, id) => {
          const event = parseEvent(entities[key], split[id]);

          if (event != null) {
            events.push(event);
          }
        });

        const title = events.map(event => event.name).join(" vs ");

        res.render('period', {
          events: events,
          title,
          colors
        });
      });
  }

});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});

const parseEvent = function(entity, query) {
  if (!entity.claims) {
    return null;
  }

  const event = {};
  event.end = new Date().toISOString();

  if (entity.claims["P373"]) {
    event.name = entity.claims["P373"][0].mainsnak.datavalue.value;
  } else if (entity.claims["P1559"]) {
    event.name = entity.claims["P1559"][0].mainsnak.datavalue.value.text;
  } else {
    console.log(query.replace(/_/g, " "));
    event.name = query.replace(/_/g, " ").replace(/'/g, "\\\'");
  }

  if (entity.claims["P569"]) {
    event.start = entity.claims["P569"][0].mainsnak.datavalue.value.time.substring(1);
    if (entity.claims["P570"]) {
      event.end = entity.claims["P570"][0].mainsnak.datavalue.value.time.substring(1);
    }
  } else if (entity.claims["P580"]) {
    event.start = entity.claims["P580"][0].mainsnak.datavalue.value.time.substring(1);
    if (entity.claims["P582"]) {
      event.end = entity.claims["P582"][0].mainsnak.datavalue.value.time.substring(1);
    }
  } else if (entity.claims["P571"]) {
    event.start = entity.claims["P571"][0].mainsnak.datavalue.value.time.substring(1);
    if (entity.claims["P576"]) {
      event.end = entity.claims["P576"][0].mainsnak.datavalue.value.time.substring(1);
    }
  } else if (entity.claims["P577"]) {
    event.start = entity.claims["P577"][0].mainsnak.datavalue.value.time.substring(1);
    event.end = entity.claims["P577"][0].mainsnak.datavalue.value.time.substring(1);
  } else if (entity.claims["P619"]) {
    event.start = entity.claims["P619"][0].mainsnak.datavalue.value.time.substring(1);
    event.end = entity.claims["P619"][0].mainsnak.datavalue.value.time.substring(1);
  }

  if (event.start) {
    return event;
  } else {
    return null;
  }
}

const createQueryURL = function(query) {
  return 'https://www.wikidata.org/w/api.php' +
    `?action=wbgetentities` +
    `&sites=enwiki` +
    `&props=claims` +
    `&titles=${query}` +
    `&format=json` +
    `&language=en`;
}
