import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from "@material-ui/core"
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from'./LineGraph'
import { sortData, prettyPrintStat } from './utils';
import "leaflet/dist/leaflet.css";
function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [casesType, setCasesType] = useState("cases")
  const [mapCenter, setMapCenter] = useState({lat:34.80746, lng: -40.4796})
  const [mapZoom, setMapZoom] = useState(2)
  const [mapCountries, setMapCountries] = useState([])

  useEffect(() => {
    //this will run once when the component loads and not again
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then( response => response.json())
      .then( data => {
        const countries = data.map(country => (
          {
            name: country.country, 
            value: country.countryInfo.iso2
          }
        ))
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      })
    }
    getCountriesData();
    
  }, [])

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => { setCountryInfo(data) })
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    
    const url = countryCode === "worldwide"? "https://disease.sh/v3/covid-19/all":`https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data);

        setMapCenter(countryCode === "worldwide"? [34.80746,-40.4796]:[data.countryInfo.lat,data.countryInfo.long])
        setMapZoom(countryCode === "worldwide"? 2 : 4);
      })
  }
  return (
    <div className="app">
      <div className="app__left">
        {/* Header */}
        {/* Title + Selec input dropdown field */}
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Global</MenuItem>
              {
                countries.map( (country, index) => (
                  <MenuItem key={index} value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>      
        </div>
        
        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType==="cases"} 
            onClick={(e) => setCasesType("cases")}
            title="Casos de Coronavirus"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={countryInfo.cases} />
          <InfoBox 
            active={casesType==="recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recuperados" cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={countryInfo.recovered} />
          <InfoBox 
            isRed
            active={casesType==="deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Muertes" cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={countryInfo.deaths} />
        </div>       

        {/* Map */}
        <Map center={mapCenter} zoom={mapZoom} countries={mapCountries} casesType={casesType}/>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3 className="app__tableTitle">Casos por país</h3>
          <Table countries={tableData} /> 
          <h3 className="app__graphTitle">{casesType==="cases"? 'Casos': casesType==="recovered"? "Recuperados":"Muertes"} a nivel mundial</h3>
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
        
        
      </Card>
    </div>
  );
}

export default App;
