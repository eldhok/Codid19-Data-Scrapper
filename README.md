# Codid19-Regional-Data-Scrapper

**About**

This is a node.js Covid19 information scrapper, capable of giving all the Covid19 Regional data available starting from the first day of Covid.
Right now it only has Covid information for different regions on Canada, but I will be adding regions of other countries soon to the list.
It also fetches Covid information of all the countries too.
If any one wants to develop a Covid19 information website or app and is stuck with not haivng enough data, feel free to use this project.


**Steps to make it run:**

1. Download the project
2. Open CovidDatabase.sql in SQL Server Management Studio ( I have used mssql, you can change it to any mysql database too - but then remember to change the import code in node.js too)
3. Create Covid database using the code.
4. Open Covid19DataScrapper folder in Visual Studio Code ( Or use any IDE of your choice)
5. Open VS Code Terminal
6. Run `npm install` , this will install all the required dependencies.
7. Now go inside the src folder by the command `cd src` 
8. Run covidDataHistory.js file by the command `node covidDataHistory.js`
   This file fetch all the Covid19 history data, ie; it inserts the tables with all the Covid19 information from the first day Covid reposrted till today. (thus you will have all the information from the starting in your database, regardless of the day you start.) 
   This file should only be ran once.
9. Now run covidDataToday.js by using the command `node covidDataToday.js` from the next day (fetch the data of the day it runs on). You should run this file everyday, so that the tables are upto date. ( You can create a timer triggger in your server to make covidDataToday.js run autamattically everyday at a particular time.
   

![Covid Database Diagram](https://github.com/eldhok/Codid19-Regional-Data-Scrapper/blob/master/CovidDatabaseDiagram.png)
