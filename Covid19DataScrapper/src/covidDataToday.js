const cheerio = require('cheerio')
const axios = require('axios')
const sql=require('mssql')

var queries = require('./models/queries.json');

var config = {
  server: "localhost",
  user: "covid19",
  password: "covid",
  database: "Covid",
  "options": {
    "encrypt": true,
    "enableArithAbort": true
    }
};

// create pool
const poolPromise =new sql.ConnectionPool(config)
    .connect()
    .then(pool=>{
        console.log('Connected to DB')
        return pool
    })
    .catch(error=>console.log('Database Connection failed'));


const countryWorld = async (callback)=>
{

    var countries = [];
    var cases = [];
    var recovered = [];
    var deaths = [];

    var DateTime = new Date().toISOString().slice(0,10);

    await axios.get('https://en.wikipedia.org/wiki/COVID-19_pandemic_by_country_and_territory#covid19-container').then((response) => 
    {
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)

        const countryCases = $('#covid19-container').find('table.wikitable.sortable').first().find('tbody').find('tr').each( (index, element) => 
        {
            
            countries.push($($(element).find('th')[1]).text().trim().replace(/\[.*?\]/gi, ''));
            cases.push($($(element).find('td')[0]).text().trim().replace(/,/g, '').replace(/No data/gi, ''));
            deaths.push($($(element).find('td')[1]).text().trim().replace(/,/g, '').replace(/No data/gi, ''));
            recovered.push($($(element).find('td')[2]).text().trim().replace(/,/g, '').replace(/No data/gi, ''));

        });

        countries.splice(0, 2);
        countries.splice(-2, 2);

        cases.splice(0, 2);
        cases.splice(-2, 2);

        deaths.splice(0, 2);
        deaths.splice(-2, 2);

        recovered.splice(0, 2);
        recovered.splice(-2, 2);

    });



    countries.forEach(async function(country, index)
    {


        const pool = await poolPromise;

        
        let active = Number(cases[index])-(Number(recovered[index])+Number(deaths[index]));
              
        const resultCovidCases = await pool.request()
        .input('TotalConfirmed', Number(cases[index]))
        .input('TotalRecovered', Number(recovered[index]))
        .input('TotalDeath', Number(deaths[index]))
        .input('ActiveCases', Number(active))
        .input('Source',"Wikipedia")
        .input('DateTime',DateTime)
        .query(queries.insertToday_COVID_CASES_CountryData, function (err, outputCovidCases) 
        {
            
            if (err) console.log(err);

            (outputCovidCases.recordset).forEach(async function(covidCases, indexCovidCases)
            {
                
                
                
                const resultCountryID = pool.request()
                .input('CountryName', String(country))
                .query(queries.select_Country, async function (err, outputCountryID) 
                {
                
                    if (err) console.log(err);

                    if(outputCountryID.rowsAffected == 1)
                    {
                        (outputCountryID.recordset).forEach(async function(CountryID, indexCountryID)
                        {

                            const resultRegionCases = pool.request()
                            .input('Covid_CaseId', covidCases.ID)
                            .input('CountryCode', CountryID.ID)
                            .query(queries.insert_Country_Cases, function (err, outputCountryCases) 
                            {
                            
                                if (err) console.log(err);
                                
                            });


                        });
                        
                    }
                    else
                    {

                        
                        const resultCountry = pool.request()
                        .input('CountryName', String(country))
                        .query(queries.insert_Country, function (err, outputCountry) 
                        {
                            
                            if (err) console.log(err);

                            
                            if(outputCountry.rowsAffected == 1)
                            {
                                (outputCountry.recordset).forEach(async function(Country_Name, indexCountry)
                                {

                                    const resultCountryCases = pool.request()
                                    .input('Covid_CaseId', covidCases.ID)
                                    .input('CountryCode', Country_Name.ID)
                                    .query(queries.insert_Country_Cases, function (err, outputCountryCases) 
                                    {
                                        
                                        if (err) console.log(err);
                                    
                                    });

                                });

                                
                            }
                        });
                    }

                
                }); 


            });
            
        
        });
    

    });
    callback.apply(this,[]);
        
}


const provinceCanada = async (callback)=>
{

    var provinces = [];
    var population = [];
    var tests = [];
    var cases = [];
    var casesPerMillion = [];
    var recovered = [];
    var deaths = [];
    var active = [];

    var DateTime = new Date().toISOString().slice(0,10);

    await axios.get('https://en.wikipedia.org/wiki/COVID-19_pandemic_in_Canada').then((response) => 
    {
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)

        const provinceCases = $('#Background_and_epidemiology').parent().nextAll('table.wikitable.sortable').first().find('tbody').find('tr').each( (index, element) => 
        {
            
            provinces.push($($(element).find('td')[0]).text().trim().replace(/,/g, ''));
            population.push($($(element).find('td')[1]).text().trim().replace(/,/g, ''));
            tests.push($($(element).find('td')[2]).text().trim().replace(/,/g, ''));
            cases.push($($(element).find('td')[4]).text().trim().replace(/,/g, ''));
            casesPerMillion.push($($(element).find('td')[5]).text().trim().replace(/,/g, ''));
            recovered.push($($(element).find('td')[6]).text().trim().replace(/,/g, ''));
            deaths.push($($(element).find('td')[7]).text().trim().replace(/,/g, ''));
            active.push($($(element).find('td')[9]).text().trim().replace(/,/g, ''));

        });

        provinces.splice(0, 2);
        provinces.splice(-2, 2);

        population.splice(0, 2);
        population.splice(-2, 2);

        tests.splice(0, 2);
        tests.splice(-2, 2);

        cases.splice(0, 2);
        cases.splice(-2, 2);

        casesPerMillion.splice(0, 2);
        casesPerMillion.splice(-2, 2);

        recovered.splice(0, 2);
        recovered.splice(-2, 2);

        deaths.splice(0, 2);
        deaths.splice(-2, 2);

        active.splice(0, 2);
        active.splice(-2, 2);

    });



    provinces.forEach(async function(province, index)
    {


        const pool = await poolPromise;
      
        const resultCovidCases = await pool.request()
        .input('TotalConfirmed', Number(cases[index]))
        .input('TotalRecovered', Number(recovered[index]))
        .input('TotalDeath', Number(deaths[index]))
        .input('ActiveCases', Number(active[index]))
        .input('TotalTests', Number(tests[index]))
        .input('Population', Number(population[index]))
        .input('Source',"Wikipedia")
        .input('DateTime',DateTime)
        .query(queries.insertToday_COVID_CASES_ProvinceData, function (err, outputCovidCases) 
        {
            
            if (err) console.log(err);


            (outputCovidCases.recordset).forEach(async function(covidCases, indexCovidCases)
            {
                
                
                const resultProvinceID = pool.request()
                .input('ProvinceName', String(province))
                .query(queries.select_Province, async function (err, outputProvinceID) 
                {
                
                    if (err) console.log(err);

                    if(outputProvinceID.rowsAffected == 1)
                    {
                        (outputProvinceID.recordset).forEach(async function(ProvinceID, indexRegionID)
                        {

                            const resultProvinceCases = pool.request()
                            .input('Covid_CaseId', covidCases.ID)
                            .input('ProvinceCode', ProvinceID.ID)
                            .query(queries.insert_Province_Cases, function (err, outputProvinceCases) 
                            {
                            
                                if (err) console.log(err);
                                
                            });


                        });
                        
                    }
                    else
                    {

                        
                        const resultProvince = pool.request()
                        .input('ProvinceName', String(province))
                        .query(queries.insert_Province_Canada, function (err, outputProvince) 
                        {
                            
                            if (err) console.log(err);

                            
                            if(outputProvince.rowsAffected == 1)
                            {
                                (outputProvince.recordset).forEach(async function(Province_Name, indexProvince)
                                {

                                    const resultProvinceCases = pool.request()
                                    .input('Covid_CaseId', covidCases.ID)
                                    .input('ProvinceCode', Province_Name.ID)
                                    .query(queries.insert_Province_Cases, function (err, outputProvinceCases) 
                                    {
                                        
                                        if (err) console.log(err);
                                    
                                    });

                                });

                                
                            }
                        });
                    }

                
                }); 


            });
                    
        });
    

    });
    callback.apply(this,[]);
      
}



const regionsCanada = async (callback, title)=>
{

    var publicHealthUnit = [];
    var cases = [];
    var casesPerMillion = [];
    var recovered = [];
    var deaths = [];
    var deathsPerMillion = [];
    var activeCases = [];

    var DateTime = new Date().toISOString().slice(0,10);

    await axios.get('https://en.wikipedia.org/w/index.php?title=' + title).then((response) => 
    {
        // Load the web page source code into a cheerio instance
        const $ = cheerio.load(response.data)

        if(title == "COVID-19_pandemic_in_Ontario")
        {
            const regionCases = $('#Geographical_distribution').parent().nextAll('table.wikitable.sortable').first().find('tbody').find('tr').each( (index, element) => 
            {

                publicHealthUnit.push($($(element).find('td')[0]).text().trim().replace(',',''));
                cases.push($($(element).find('td')[1]).text().trim().replace(/,/g, ''));
                casesPerMillion.push($($(element).find('td')[2]).text().trim().replace(/,/g, ''));
                recovered.push($($(element).find('td')[3]).text().trim().replace(/,/g, ''));
                deaths.push($($(element).find('td')[4]).text().trim().replace(/,/g, ''));
                deathsPerMillion.push($($(element).find('td')[5]).text().trim().replace(/,/g, ''));

            });

            publicHealthUnit.shift();
            cases.shift();
            casesPerMillion.shift();
            recovered.shift();
            deaths.shift();
            deathsPerMillion.shift();

        }
        else if(title == "COVID-19_pandemic_in_Nova_Scotia")
        {
            const regionCases = $('#Data_by_health_zone').parent().nextAll('table.wikitable.sortable').first().find('tbody').find('tr').each( (index, element) =>
            {

                publicHealthUnit.push($($(element).find('td')[0]).text().trim());
                cases.push($($(element).find('td')[1]).text().trim());
                deaths.push($($(element).find('td')[4]).text().trim());

            });

            publicHealthUnit.splice(0, 2);
            cases.splice(0, 2);
            deaths.splice(0, 2);  

        }
        else if(title == "COVID-19_pandemic_in_Saskatchewan")
        {
            const regionCases = $('#Regional_distribution').parent().nextAll('table.wikitable.sortable').first().find('tbody').find('tr').each( (index, element) =>
            {
                publicHealthUnit.push($($(element).find('td')[0]).text().trim());
                cases.push($($(element).find('td')[1]).text().trim());
                activeCases.push($($(element).find('td')[2]).text().trim());
                recovered.push($($(element).find('td')[5]).text().trim());
                deaths.push($($(element).find('td')[6]).text().trim()); 

            });  

            publicHealthUnit.splice(0, 2);
            publicHealthUnit.splice(-2, 2);
    
            cases.splice(0, 2);
            cases.splice(-2, 2);
    
            activeCases.splice(0, 2);
            activeCases.splice(-2, 2);
    
            recovered.splice(0, 2);
            recovered.splice(-2, 2);
    
            deaths.splice(0, 2);
            deaths.splice(-2, 2);   

        }

    });



    publicHealthUnit.forEach(async function(healthUnit, index)
    {


        const pool = await poolPromise;

        
        let active = Number(cases[index])-(Number(recovered[index])+Number(deaths[index]));
             
        const resultCovidCases = await pool.request()
        .input('TotalConfirmed', Number(cases[index]))
        .input('TotalRecovered', Number(recovered[index]))
        .input('TotalDeath', Number(deaths[index]))
        .input('ActiveCases', Number(active))
        .input('Source',"Wikipedia")
        .input('DateTime',DateTime)
        .query(queries.insertToday_COVID_CASES_RegionData, function (err, outputCovidCases) 
        {
            
            if (err) console.log(err);

            (outputCovidCases.recordset).forEach(async function(covidCases, indexCovidCases)
            {
                
                const resultRegionID = pool.request()
                .input('RegionName', String(healthUnit))
                .query(queries.select_Region, async function (err, outputRegionID) 
                {
                
                    if (err) console.log(err);

                    if(outputRegionID.rowsAffected == 1)
                    {
                        (outputRegionID.recordset).forEach(async function(RegionID, indexRegionID)
                        {

                            const resultRegionCases = pool.request()
                            .input('Covid_CaseId', covidCases.ID)
                            .input('RegionCode', RegionID.ID)
                            .query(queries.insert_Region_Cases, function (err, outputRegionCases) 
                            {
                            
                                if (err) console.log(err);
                                
                            });


                        });
                        
                    }
                    else
                    {

                        if(title == "COVID-19_pandemic_in_Ontario")
                        {
                            var regionInsert = queries.insert_Region_Ontario;
                        }
                        else if(title == "COVID-19_pandemic_in_Nova_Scotia")
                        {
                            var regionInsert = queries.insert_Region_Nova_Scotia;
                        }
                        else if(title == "COVID-19_pandemic_in_Saskatchewan")
                        {
                            var regionInsert = queries.insert_Region_Saskatchewan;       
                        }

                        const resultRegion = pool.request()
                        .input('RegionName', String(healthUnit))
                        .query(regionInsert, function (err, outputRegion) 
                        {
                            
                            if (err) console.log(err);

                            
                            if(outputRegion.rowsAffected == 1)
                            {
                                (outputRegion.recordset).forEach(async function(Region, indexRegion)
                                {
                                    
                                    const resultRegionCases = pool.request()
                                    .input('Covid_CaseId', covidCases.ID)
                                    .input('RegionCode', Region.ID)
                                    .query(queries.insert_Region_Cases, function (err, outputRegionCases) 
                                    {
                                        
                                        if (err) console.log(err);
                                    
                                    });

                                });

                                
                            }
                        });
                    }

                
                }); 


            });
                    
        });
    

    });

	callback.apply(this,[]);      
}


console.log('Getting Covid Cases for all the Countries')
countryWorld(function(){
    console.log('Getting Covid Cases for all Provinces in Canada')
    provinceCanada(function(){
        console.log('Getting Covid Cases for all Regions in Ontario, Canada')
        regionsCanada(function(){
            console.log('Getting Covid Cases for all Regions in NovaScotia, Canada')
            regionsCanada(function(){
                console.log('Getting Covid Cases for all Regions in Saskatchewan, Canada')
                regionsCanada(function(){
                
                }, "COVID-19_pandemic_in_Saskatchewan");
            }, "COVID-19_pandemic_in_Nova_Scotia");
        }, "COVID-19_pandemic_in_Ontario");
    });
});




