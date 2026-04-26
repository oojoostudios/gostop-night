export default {
  '*.{ts,tsx,js,jsx,mjs}': ['oxfmt --write', 'oxlint -c oxlint.json'],
  '*.{json,css}': 'oxfmt --write',
};
