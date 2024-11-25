import csv


# HTML content as a sample (ensure this matches what you're scraping)
html_content = '''
<h2 class="p1N2lc">Digital Business Marketing Apprenticeship, March 2025 Start (English)</h2>
<span>Intern and Apprentice</span>
<span class="r0wTof ">Hyderabad, Telangana, India</span>
<span>Google</span>
'''

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Extract the job title
job_title_tag = soup.find('h2', class_='p1N2lc')
job_title = job_title_tag.text.strip() if job_title_tag else 'Job title not found'

# Extract the job type
job_type_tag = soup.find_all('span')[0]
job_type = job_type_tag.text.strip() if job_type_tag else 'Job type not found'

# Extract the location
location_tag = soup.find('span', class_='r0wTof')
location = location_tag.text.strip() if location_tag else 'Location not found'

# Extract the company name
company_tag = soup.find_all('span')[2]
company = company_tag.text.strip() if company_tag else 'Company not found'

# Write the extracted data to a CSV file
with open('job_listings.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    
    # Write the header
    writer.writerow(['Job Title', 'Job Type', 'Location', 'Company'])
    
    # Write the job data
    writer.writerow([job_title, job_type, location, company])

print("Data has been written to 'job_listings.csv'")
