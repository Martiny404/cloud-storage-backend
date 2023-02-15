export function activateAccountTemplate(link: string): string {
  return `
   <div>
	  <h1>Регистрация на форуме</h1>
	  <div
		  style="
			background-color: #8e92fa;
			padding: 15px;
			border-radius: 8px;
			color: #fff;
			font-weight: 600;
		"
	  >
		  <p style="font-weight: 600">Приветствуем вас, дорогой друг!</p>
		  <p style="font-weight: 600">Спасибо за регистрацию на нашем форуме!</p>
		  <a href="${link}">подтвердить регистрацию</a>
	  </div>
  </div>
  `;
}
