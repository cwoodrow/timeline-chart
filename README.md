# Timeline viewer
Time line graph generator based on Wikidata. This quick and dirty !

## Exemples

A few examples :

* https://timeline-chart.herokuapp.com?q=Sarah_Bernhardt|Edmond_Rostand|American_Civil_War
* https://timeline-chart.herokuapp.com?q=Cristiano_Ronaldo|2014_FIFA_World_Cup|Lionel_Messi

## Data

Data comes from (not so documented) `https://www.wikidata.org/`.

**P373** or **P1559**: Entity name

Properties for persons :
* **P569** : Date of birth
* **P570** : Date of death (`Date.now()` if person's not dead)

Properties for events :
* **P580** : Start time
* **P582** : End time

Properties are available here : https://raw.githubusercontent.com/maxlath/wikidata-properties-dumper/master/properties/en.json.
