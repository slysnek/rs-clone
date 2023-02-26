export const footer = document.createElement('footer');
footer.classList.add('footer');

const githubNames = ['@AlinaLaniuk', '@Slysnek', '@Albedo-13'];
const githubLinks = ['https://github.com/AlinaLaniuk', 'https://github.com/slysnek', 'https://github.com/Albedo-13'];

const logoWrapper = document.createElement('a');
const year = document.createElement('span');
const logo = document.createElement('div');
year.textContent = '2023';
logo.classList.add('logo');
year.classList.add('year');
logoWrapper.setAttribute('href', 'https://rs.school/js/');
logoWrapper.appendChild(logo);

for (let i = 0; i < 3; i++) {
  const githubPerson = document.createElement('div');
  const githubPersonImage = document.createElement('div');
  const githubPersonLink = document.createElement('a');

  githubPerson.classList.add('github-person');
  githubPersonImage.classList.add(`github-photo-${i}`);
  githubPersonLink.classList.add('github-link');

  githubPersonLink.textContent = githubNames[i];

  githubPersonLink.setAttribute('href', githubLinks[i]);
  githubPerson.appendChild(githubPersonImage);
  githubPerson.appendChild(githubPersonLink);
  footer.appendChild(githubPerson);
}

footer.appendChild(logoWrapper);
footer.appendChild(year);
