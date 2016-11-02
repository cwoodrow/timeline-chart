const express = require('express');
const expressHandlebars = require('express-handlebars');
const unirest = require('unirest');

var app = express();


app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
  var query = req.query['q'];

  console.log(query);

  if (!query) {
    res.send('<h1 style="font-family:arial;">To create a timeline chart to compare wikipedia people and / or events : </h1>' +
      '<a href="https://timeline-chart.herokuapp.com?q=Sarah_Bernhardt|Edmond_Rostand|American_Civil_War">&q=&lt;wikipedia_name1&gt;|&lt;wikipedia_name2&gt;|&lt;wikipedia_name3&gt;|...</a>');
  } else {
    unirest.get(createQueryURL(query))
      .end(response => {
        const events = [];
        const entities = response.body.entities;
        const keys = Object.keys(entities);

        keys.forEach(key => {
          const event = parseEvent(entities[key]);

          if (event != null) {
            events.push(event);
          }
        });

        const title = events.map(event => event.name).join(" vs ");

        res.render('period', {
          events: events,
          title
        });
      });
  }

});

var port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});

const parseEvent = function(entity) {
  if (!entity.claims) {
    return null;
  }

  const event = {};
  event.end = new Date().toISOString();

  if (entity.claims["P373"]) {
    event.name = entity.claims["P373"][0].mainsnak.datavalue.value;
  } else if (entity.claims["P1559"]) {
    event.name = entity.claims["P1559"][0].mainsnak.datavalue.value.text;
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
