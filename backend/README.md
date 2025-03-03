# Bullpen Budgets

Demo URL: https://bullpenbudgets.com/

Demo Video: https://github.com/user-attachments/assets/ec93ea52-9255-4ebc-a746-8ea6277c4136

Bullpen Budgets is an MLB analytics platform designed for analysts and bettors who need advanced statistics about bullpen health and usage across all 30 MLB teams. The application provides comprehensive data about pitcher workload, recent usage patterns, and historical trends.

## Technologies:
* Python (BeautifulSoup4)
* HTML/CSS
* Node.js
* AWS S3
* AWS Lambda
* AWS Route 53
* Git

## Notable Features:
* View detailed bullpen data for all 30 MLB teams
* Track pitcher usage for last 5 games per team
* Monitor pitch count analytics:
  * 3-day totals
  * 7-day totals
  * 14-day totals
* Favorite team system:
  * Add up to 10 favorite teams
  * Quick access bar for favorites
  * Persistent favorites storage
* Automated data updates:
  * Daily scraping of MLB statistics
  * Automatic data processing
  * Regular deployment updates
* Mobile-responsive design
* Custom domain routing through Route 53
* Serverless architecture using Lambda
* Static file hosting on S3
* SEO optimization for baseball statistics


## AWS Configuration
* S3 Bucket: Static website hosting
* Lambda Function: Daily data collection
* Route 53: Domain management and routing

## Data Collection
* Automated scraping every 24 hours
* Historical data preservation
* Error handling and retry logic
* Data validation and cleaning

## Deployment
* Frontend hosted on AWS S3
* Backend tasks run on AWS Lambda
