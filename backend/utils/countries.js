const fallbackCountries = [
  { name: { common: 'United States' }, currencies: { USD: { name: 'United States dollar' } } },
  { name: { common: 'Canada' }, currencies: { CAD: { name: 'Canadian dollar' } } },
  { name: { common: 'United Kingdom' }, currencies: { GBP: { name: 'Pound sterling' } } },
  { name: { common: 'India' }, currencies: { INR: { name: 'Indian rupee' } } },
  { name: { common: 'Australia' }, currencies: { AUD: { name: 'Australian dollar' } } },
  { name: { common: 'Germany' }, currencies: { EUR: { name: 'Euro' } } },
  { name: { common: 'France' }, currencies: { EUR: { name: 'Euro' } } },
  { name: { common: 'Japan' }, currencies: { JPY: { name: 'Japanese yen' } } },
  { name: { common: 'Singapore' }, currencies: { SGD: { name: 'Singapore dollar' } } },
  { name: { common: 'United Arab Emirates' }, currencies: { AED: { name: 'UAE dirham' } } },
];

const getCurrencyForCountry = (country, countries = fallbackCountries) => {
  const countryData = countries.find(
    (item) => item.name.common.toLowerCase() === String(country || '').toLowerCase()
  );

  if (!countryData?.currencies) {
    return 'USD';
  }

  return Object.keys(countryData.currencies)[0] || 'USD';
};

module.exports = {
  fallbackCountries,
  getCurrencyForCountry,
};
