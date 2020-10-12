Create database Covid
Go
use Covid
Go
Create table Country(
	ID int NOT NULL Identity constraint country_fk primary key (ID),
	Name varchar(255) NOT NULL);

Create table Province(
	ID int NOT NULL Identity constraint province_pk primary key (ID),
	Name varchar(255) NOT NULL,
	CountryId int constraint province_fk foreign key(CountryId) references Country(ID));

Create table Region(
	ID int NOT NULL Identity constraint region_pk primary key (ID),
	Name varchar(255) NOT NULL,
	ProvinceId int constraint region_fk foreign key(ProvinceId) references Province(ID));

Create table COVID_CASES(
	ID int NOT NULL Identity constraint covid_pk primary key (ID),
	TotalConfirmed int,
	TotalRecovered int,
	TotalDeath int,
	ActiveCases int,
	TotalTests int,
	Population int,
	DateTime date,
	Source varchar(255));

Create table Country_Cases(
	Covid_CaseId int not null constraint country_caseid_fk foreign key(Covid_CaseId) references COVID_CASES(ID),
	CountryCode int not null constraint country_countrycode_fk foreign key(CountryCode) references Country(ID))

Create table Province_Cases(
	Covid_CaseId int not null constraint province_caseid_fk foreign key(Covid_CaseId) references COVID_CASES(ID),
	ProvinceCode int not null constraint province_provincecode_fk foreign key(ProvinceCode) references Province(ID))

Create table Region_Cases(
	Covid_CaseId int not null constraint region_caseid_fk foreign key(Covid_CaseId) references COVID_CASES(ID),
	RegionCode int not null constraint region_regioncode_fk foreign key(RegionCode) references Region(ID));