'use strict';

const app = document.querySelector('.app'),
	  err = document.querySelector('.error'),
	  menuCopy = document.querySelector('.menu_copy'),
	  menuUrl = document.querySelector('.menu__url'),
	  burger = document.querySelector('.burger'),
	  menu = document.querySelector('.menu'),
	  newImg = document.querySelector('.new'),
	  drag = document.querySelector('.drag'),
	  comments = document.querySelector('.comments'),
	  commentsForm = document.querySelector('.comments__form'),
	  commentsTools = document.querySelector('.comments-tools'),
	  commentsBtn = document.querySelector('.menu__toggle-bg'),
	  commentsOn = document.querySelector('.comments-on'),
	  commentsOff = document.querySelector('.comments-off'),
	  draw = document.querySelector('.draw'),
	  drawTools = document.querySelector('.draw-tools'),
	  share = document.querySelector('.share'),
	  shareTools = document.querySelector('.share-tools'),
	  image = document.querySelector('.current-image'),
	  imageLoader = document.querySelector('.image-loader');


let wss, response, id, isLoad, isShareToolsVisible, isDrawToolsVisible, 
	isCommentsToolsVisible;


if (localStorage.getItem('posX')) {
	menu.style.top = `${localStorage.getItem('posY')}`
	menu.style.left = `${localStorage.getItem('posX')}`

}

app.removeChild(commentsForm);

const imageWrap = document.createElement('div');
let mask = document.createElement('canvas'),
	canvas = document.createElement('canvas');

resetComment();

imageWrap.className = 'image-wrap';
mask.className = 'mask';
canvas.className = 'canvas';

app.appendChild(imageWrap);
imageWrap.appendChild(image);
imageWrap.appendChild(mask);
imageWrap.appendChild(canvas);

app.addEventListener('drop', dropFiles);
app.addEventListener('dragover', event => event.preventDefault());

function dropFiles(event) {
	event.preventDefault();
	if (!isLoad) {
		let file = event.dataTransfer.files[0];
		if ((file.type === 'image/png') || (file.type === 'image/jpeg')) {
			
			err.classList.remove('display-init');
			err.classList.add('display-none');
			sendFile(file);
		} else {
			
			err.classList.remove('display-none');
			err.classList.add('display-init');
		}	
	} else {
		err.classList.remove('display-none');
		err.classList.add('display-init');
		err.classList.add('z-index-10');
		document.querySelector('.error__message').textContent 
		= 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню';
		document.addEventListener('click', () => {
			err.classList.remove('display-init');
			err.classList.add('display-none');
		})
	}		
}

newImg.addEventListener('click', (event) => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/jpeg, image/png';
	input.click();
	input.addEventListener('change', event => {
		if(canvas) {
			resetCanvas()
		}
		const file = event.currentTarget.files[0];
		sendFile(file);
	});
});

function resetComment() {

	const comments = app.querySelectorAll('[data-top]');
	comments.forEach(comment => {
		comment.remove()

	})	
}

function resetCanvas() {
	const resetMask = mask;
	const canvasContextReset = resetMask.getContext('2d');
    canvasContextReset.clearRect(0, 0, resetMask.width, resetMask.height);
	const resetImageDraw = canvas;
	const canvasContextResetImg = resetImageDraw.getContext('2d');
    canvasContextResetImg.clearRect(0, 0, resetImageDraw.width, resetImageDraw.height);
    
};

burger.addEventListener('click', () => {

	burger.classList.remove('display-inline-block');
	burger.classList.add('display-none');
	drawTools.classList.remove('display-inline-block');
	drawTools.classList.add('display-none');
	isDrawToolsVisible = false;
	commentsTools.classList.remove('display-inline-block');
	commentsTools.classList.add('display-none');
	isCommentsToolsVisible = false;
	shareTools.classList.remove('display-inline-block');
	shareTools.classList.add('display-none');
	isShareToolsVisible = false;
	newImg.classList.remove('display-none');
	newImg.classList.add('display-inline-block');
	comments.classList.remove('display-none');
	comments.classList.add('display-inline-block');
	draw.classList.remove('display-none');
	draw.classList.add('display-inline-block');
	share.classList.remove('display-none');
	share.classList.add('display-inline-block');

});

comments.addEventListener('click', () => {

	newImg.classList.remove('display-inline-block');
	newImg.classList.add('display-none');
	draw.classList.remove('display-inline-block');
	draw.classList.add('display-none');
	share.classList.remove('display-inline-block');
	share.classList.add('display-none');
	burger.classList.remove('display-none');
	burger.classList.add('display-inline-block');
	commentsTools.classList.remove('display-none');
	commentsTools.classList.add('display-inline-block');

	canvas.classList.remove('z-index-20');
	canvas.classList.add('z-index-10');
	mask.classList.remove('z-index-10');
	mask.classList.add('z-index-20');	
	
	isCommentsToolsVisible = true;
});

share.addEventListener('click', () => {

	if (!isShareToolsVisible) {
		newImg.classList.remove('display-inline-block');
		newImg.classList.add('display-none');
		comments.classList.remove('display-inline-block');
		comments.classList.add('display-none');
		draw.classList.remove('display-inline-block');
		draw.classList.add('display-none');
		burger.classList.remove('display-none');
		burger.classList.add('display-inline-block');
		shareTools.classList.remove('display-none');
		shareTools.classList.add('display-inline-block');

		isShareToolsVisible = true;	
	} else {
		share.classList.remove('display-inline-block');
		share.classList.add('display-none');
		shareTools.classList.remove('display-inline-block');
		shareTools.classList.add('display-none');
		burger.classList.remove('display-none');
		burger.classList.add('display-inline-block');
		comments.classList.remove('display-none');
		comments.classList.add('display-inline-block');
		commentsTools.classList.remove('display-none');
		commentsTools.classList.add('display-inline-block');

		isCommentsToolsVisible = true;
		isShareToolsVisible = false;
	}
});


menuCopy.addEventListener('click', () => {
	menuUrl.select();
    document.execCommand('copy');
    alert('Ссылка скопирована в буфер обмена') 
});

let floatMenu = null, shiftX = 0, shiftY = 0, minY, minX, maxX, maxY, movedPiece = null;

const dragStart = event => {
    floatMenu = menu;
    minY = app.offsetTop;
    minX = app.offsetLeft;
    maxX = app.offsetLeft + app.offsetWidth - floatMenu.offsetWidth;
    maxY = app.offsetTop + app.offsetHeight - floatMenu.offsetHeight;
    shiftX = event.pageX - event.target.getBoundingClientRect().left - window.pageXOffset;
    shiftY = event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset;
    
};

const dragMenu = ((x, y) => {
  if (floatMenu) {
    x = x - shiftX;
    y = y - shiftY;
    x = Math.min(x, maxX);
    y = Math.min(y, maxY);
    x = Math.max(x, minX);
    y = Math.max(y, minY);
    floatMenu.classList.add('white-space-no-wrap');
    floatMenu.style.left = x + 'px';
    floatMenu.style.top = y + 'px';
  }
});

drag.addEventListener('mousedown', dragStart);
drag.addEventListener('mouseup', event => floatMenu = null);
drag.addEventListener('mouseup', setCoordinates);
document.addEventListener('mousemove', event => dragMenu(event.pageX, event.pageY));

function setCoordinates(event) {
	localStorage.setItem('posX', menu.style.left)
	localStorage.setItem('posY', menu.style.top)
}

function moveFloatMenu() {
    if (app.getBoundingClientRect().right - menu.getBoundingClientRect().right < 5) {
        menu.style.left = (app.offsetWidth - menu.offsetWidth) - 10 + 'px';

    }
    requestAnimationFrame(moveFloatMenu);
}

moveFloatMenu()

draw.addEventListener('click', () => {

	newImg.classList.remove('display-inline-block');
	newImg.classList.add('display-none');
	comments.classList.remove('display-inline-block');
	comments.classList.add('display-none');
	share.classList.remove('display-inline-block');
	share.classList.add('display-none');
	burger.classList.remove('display-none');
	burger.classList.add('display-inline-block');
	drawTools.classList.remove('display-none');
	drawTools.classList.add('display-inline-block');
	canvas.classList.remove('z-index-10');
	canvas.classList.add('z-index-20');
	mask.classList.remove('z-index-20');
	mask.classList.add('z-index-10');
	
	isDrawToolsVisible = true;
	canvas.width = image.width;
	canvas.height = image.height;
		
	const ctx = canvas.getContext('2d'), brushSize = 4;
	let color = '#6cbe47', curves = [], drawing = false, isRepaint = false;
	
	document.querySelector('.red').addEventListener('click', () =>
		color = '#ea5d56');
	document.querySelector('.yellow').addEventListener('click', () =>
		color = '#f3d135');
	document.querySelector('.green').addEventListener('click', () =>
		color = '#6cbe47');
	document.querySelector('.blue').addEventListener('click', () =>
		color = '#53a7f5');
	document.querySelector('.purple').addEventListener('click', () =>
		color = '#b36ade');

	function smoothCurveBetween (p1, p2) {
	    const cp = p1.map((coord, index) => (coord + p2[index]) / 2);
	    ctx.quadraticCurveTo(...p1, ...cp);
	}

	function smoothCurve(points) {
	    ctx.beginPath();
	    ctx.lineWidth = brushSize;
	    ctx.strokeStyle = color;
	    ctx.lineJoin = 'round';
	    ctx.lineCap = 'round';
	  
	    ctx.moveTo(...points[0]);
		for(let i = 1; i < points.length - 1; i++) {
			smoothCurveBetween(points[i], points[i + 1]);
		}

	    ctx.stroke();
	}

	canvas.addEventListener('mousedown', function (event) { 
		

   		 if (!isDrawToolsVisible) return;

   		 	drawing = true;
	  		const curve = [];
			curve.push([event.offsetX, event.offsetY]);
			curves.push(curve);
			isRepaint = true;
	});

	canvas.addEventListener('mouseup', (event) => {

		let canvasData = canvas,
			imageData = canvasData.toDataURL('image/png'),
			ArrayData = URItoBin(imageData);

		wss.send(ArrayData.buffer);

		drawing = false;
		curves = [];
	    
		function URItoBin(dataURI) {
			const marker = ';base64,';
			let markerIndex = dataURI.indexOf(marker) + marker.length,
				base64 = dataURI.substring(markerIndex),
				raw = window.atob(base64),
				rawLength = raw.length,
				ArrayData = new Uint8Array(new ArrayBuffer(rawLength));

			for(let i = 0; i < rawLength; i++) {
			  ArrayData[i] = raw.charCodeAt(i);
			};

			return ArrayData;
		};
	});

	canvas.addEventListener('mouseleave', (event) => {
	    curves = [];
	    drawing = false;
	});

	canvas.addEventListener('mousemove', function(event) {
	    if (!drawing) return; 
	      const point = [event.offsetX, event.offsetY];
	      curves[curves.length - 1].push(point);
	      isRepaint = true;
	    
	});

	function repaint () {
	    curves.forEach((curve) => smoothCurve(curve));
	}

	function tick () {
	    if(isRepaint) {
	      repaint();
	      isRepaint = false;
	    }
	    window.requestAnimationFrame(tick);
	}
	tick();
});

function placeMask(url) {
	const maskLayer = mask;
    maskLayer.width = image.width;
    maskLayer.height = image.height;
	const context = maskLayer.getContext('2d');
    context.clearRect(0, 0, maskLayer.width, maskLayer.height); 
	let img = new Image;
	img.src = url;

	img.addEventListener('load', () => { 
    	context.drawImage(img, 0, 0); 
	});

};

//comments

const commentForm = document.createElement('form'),
	commentMarker = document.createElement('span'),
	commentMarkerCheck = document.createElement('input'),
	commentBody = document.createElement('div'),
	comment = document.createElement('div'),
	commentLoader = document.createElement('div'),
	commentTime = document.createElement('p'),
	commentMessage = document.createElement('p'),
	loader = document.createElement('div'),
	loaderSquare = document.createElement('span'),
	commentInput = document.createElement('textarea'),
	commentClose = document.createElement('input'),
	commentSubmit = document.createElement('input');

commentForm.className = 'comment__form';
commentMarker.className = 'comments__marker';
commentMarkerCheck.className = 'comments__marker-checkbox';
commentMarkerCheck.type = 'checkbox';
commentMarkerCheck.checked = true;
commentBody.className = 'comments__body';
comment.className = 'comment';
commentTime.className = 'comment__time';
commentMessage.className = 'comment__message';
commentLoader.className = 'comment';
commentLoader.classList.add('comment__loader');
loader.className = 'loader';
commentInput.className = 'comments__input';
commentInput.placeholder = 'Напишите ответ...';
commentClose.className = 'comments__close';
commentClose.type = 'button';
commentClose.value = 'Закрыть';
commentSubmit.className = 'comments__submit';
commentSubmit.type = 'submit';
commentSubmit.value = 'Отправить';

imageWrap.appendChild(commentForm);

commentForm.appendChild(commentMarker);
commentForm.appendChild(commentMarkerCheck);
commentForm.appendChild(commentBody);
commentBody.appendChild(comment);
comment.appendChild(commentTime);
comment.appendChild(commentMessage);
commentBody.appendChild(commentLoader);
commentLoader.appendChild(loader);
loader.appendChild(loaderSquare);
loader.appendChild(loaderSquare.cloneNode());
commentBody.appendChild(commentInput);
commentBody.appendChild(commentClose);
commentBody.appendChild(commentSubmit);

commentForm.classList.add('display-none');
commentForm.classList.add('position-abs');
commentForm.classList.add('z-index-100');
commentLoader.classList.add('display-none');

init()

function hideMarkers() {
	const markers = document.querySelectorAll('.comments__marker-checkbox');
		for (const marker of markers) {
			marker.checked = false;
		}
}

mask.addEventListener('click', event => {

	if (!isCommentsToolsVisible && commentsOn.checked) return; {	

		hideMarkers();
		
		commentForm.style.top = `${event.offsetY - 14}px`;
		commentForm.style.left = `${event.offsetX - 22}px`;

		commentForm.classList.remove('display-none');
		commentForm.classList.add('display-init');
		commentForm.querySelector('.comment__loader').classList.remove('display-init');
		commentForm.querySelector('.comment__loader').classList.add('display-none');
		commentForm.querySelector('.comments__marker-checkbox').checked = true;
		commentForm.querySelector('.comments__input').focus();

		commentForm.querySelector('.comments__close').addEventListener('click', event => {

			commentForm.querySelector('.comments__marker-checkbox').checked = false;

			if(!commentForm.querySelector('.comment__message').textContent) {
				commentForm.classList.remove('display-init');
				commentForm.classList.add('display-none');
			}
		});
	}
});

app.addEventListener('submit', event => {
	// hideMarkers();
	// document.querySelector('.comment__form').classList.add('display-block')
	event.preventDefault();
	event.target.querySelector('.comment__loader').classList.remove('display-none');
	event.target.querySelector('.comment__loader').classList.add('display-init');
	event.target.querySelector('.comments__marker-checkbox').checked = true;
		

	const input = event.target.querySelector('.comments__input'),
		comment = {'message' : input.value, 'left' : parseInt(event.target.style.left), 'top' : parseInt(event.target.style.top)};                                               
	
	sendComment(comment); 
	
});

function sendComment(comment) {

	commentInput.value = '';
	let requestArray = [];
	for (let property in comment) {
		let encodedKey = encodeURIComponent(property);
		let encodedValue = encodeURIComponent(comment[property]);
		requestArray.push(encodedKey + '=' + encodedValue);
	};
	requestArray = requestArray.join('&');
	const request = new XMLHttpRequest();
	request.addEventListener('error', () => console.log(request.responseText));
	request.addEventListener('load', () => {
		if (request.status === 200) {
	    	let response = JSON.parse(request.responseText);
		}
	});
	request.open('POST', `https://neto-api.herokuapp.com/pic/${id}/comments`, true);
	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	request.send(requestArray);
	console.log(requestArray);

}

function loadComments(comments) {

	for (let comment in comments) {
    	let currentComment = {message: comments[comment].message,
        left: comments[comment].left,
        top: comments[comment].top};                  
    	renderComment(currentComment);
  }

};

function renderComment(comment) {
	const currentFormNode = document.querySelector(`.comment__form[data-left='${comment.left}'][data-top='${comment.top}']`);
	if (currentFormNode) { 
    	currentFormNode.querySelector('.comment__loader').classList.remove('display-init')	
    	currentFormNode.querySelector('.comment__loader').classList.add('display-none')	
    	renderNewCommentElement(currentFormNode, comment);
    	document.querySelector('.comment__form').classList.remove('display-block')
    	document.querySelector('.comment__form').classList.add('display-none')
	} else {
    	placeComment(comment);
	}; 

};

function placeComment(comment) {
	const commentsFormSimple = commentForm;
	const commentEl = commentsFormSimple.cloneNode(true);
	
	commentEl.classList.remove('display-none');
	commentEl.classList.add('display-init');
    commentEl.style.top = `${comment.top}px`;
    commentEl.style.left = `${comment.left}px`;
    commentEl.dataset.top = comment.top;
    commentEl.dataset.left = comment.left;
	commentEl.querySelector('.comment__loader').classList.remove('display-init')
	commentEl.querySelector('.comment__loader').classList.add('display-none')		
	commentEl.querySelector('.comments__marker-checkbox').checked = true;

	let date = new Date();
	let time = `${('0' + date.getHours()).slice(-2)}:${('0' 
		+ date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
	const commentDateTime = commentEl.querySelector('.comment__time');
    commentDateTime.textContent = time;
	const commentMessage = commentEl.querySelector('.comment__message');
    commentMessage.setAttribute('style', 'white-space: pre;');
    commentMessage.textContent = comment.message;
	const closeBtn = commentEl.querySelector('.comments__close');
    closeBtn.addEventListener('click', () => {
    	commentForm.reset();
    	commentEl.querySelector('.comments__marker-checkbox').checked = false;
    });
	
	imageWrap.appendChild(commentEl);
	showCommentForm();
};

function renderNewCommentElement(currentFormNode, comment) {
	const currentFormNodeCommentsBody = currentFormNode.querySelector('.comments__body'),
		currentFormNodeLoader = currentFormNode.querySelector('.comment__loader'),
		commentsFormSimple = currentFormNodeCommentsBody.querySelector('.comment'),
		commentEl = commentsFormSimple.cloneNode(true);
	let date = new Date();
	let time = `${('0' + date.getHours()).slice(-2)}:${('0' 
		+ date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`; 
	const commentDateTime = commentEl.querySelector('.comment__time');
    commentDateTime.textContent = time;
	const commentMessage = commentEl.querySelector('.comment__message');
    commentMessage.setAttribute('style', 'white-space: pre;');
    commentMessage.textContent = comment.message;
    currentFormNodeCommentsBody.insertBefore(commentEl, currentFormNodeLoader);
	currentFormNode.reset();
	currentFormNode.querySelector('.comments__marker-checkbox').checked = true;
	currentFormNode.querySelector('.comments__input').focus();
	showCommentForm();
};

commentsBtn.addEventListener('click', showCommentForm);

function showCommentForm() {

	const cmntsForm = document.querySelectorAll('.comment__form')
	
	cmntsForm.forEach(cmnt => {

		if (commentsOn.checked) {
			cmnt.classList.remove('display-none');
			cmnt.classList.remove('display-init');
			cmnt.classList.add('display-block');
			
		} else {
			cmnt.classList.remove('display-block');
			cmnt.classList.remove('display-init');
			cmnt.classList.add('display-none');
		}
	})
}

//server

function init() {
	
	if (window.location.href.indexOf('?id=') !== -1) {
    image.src = localStorage.getItem('saveImg');
    id = localStorage.getItem('saveId');

	burger.classList.remove('display-none');
	burger.classList.add('display-inline-block');
	comments.classList.remove('display-none');
	comments.classList.add('display-inline-block');
	commentsTools.classList.remove('display-none');
	commentsTools.classList.add('display-inline-block');
	newImg.classList.remove('display-inline-block');
	newImg.classList.add('display-none');
	isCommentsToolsVisible = true;
	menuUrl.value= window.location.href;

	document.querySelector('.comment__form').classList.add('display-none');
	hideMarkers();
	
	socketConnect();
	
	};
}

let host

function sendFile(file) {

	const formData = new FormData();
	formData.append('title', file.name);
	formData.append('image', file);

	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://neto-api.herokuapp.com/pic');
	xhr.addEventListener('loadstart', () => {
		
		image.classList.add('display-none')
		imageLoader.classList.remove('display-none')
		imageLoader.classList.add('display-init')
		
	});

	xhr.addEventListener('loadend', () => {
		
		imageLoader.classList.remove('display-init')
		imageLoader.classList.add('display-none')
		
	});

	xhr.addEventListener('load', () => {
		if (!xhr.status === 200) {return}; 
			init()
			response = JSON.parse(xhr.responseText);
			console.log(response);
			isLoad = true;

			id = response.id;
			newImg.classList.add('display-none');
			comments.classList.add('display-none');
			draw.classList.add('display-none');
			burger.classList.add('display-inline-block');
			share.classList.add('display-inline-block');
			shareTools.classList.add('display-inline-block');
			
			isShareToolsVisible = true
			host = `${window.location.origin}${window.location.pathname}?id=${id}`;
    		
			resetComment();
			resetCanvas();
			socketConnect();
			history.pushState(null, null, host);
			menuUrl.value = host;
		
	});

	xhr.send(formData);
}

function socketConnect() {
	wss = new WebSocket(`wss://neto-api.herokuapp.com/pic/${id}`);

	wss.addEventListener('open', () => {
		console.log('Есть коннект');
	});

	wss.addEventListener('message', event => {

		image.addEventListener('load', () => {
			mask.width = image.clientWidth;
			mask.height = image.clientHeight;

			document.querySelector('.comment__form').classList.add('display-none')
			hideMarkers();
		})

		let message = JSON.parse(event.data);
		console.log(message);

		if (message.event == 'pic') {
			localStorage.setItem('saveImg', message.pic.url);
			localStorage.setItem('saveId', message.pic.id);
			image.src = message.pic.url;
			image.classList.remove('display-none');
			image.classList.add('initial');

		    image.addEventListener('load', () => {
				if (message.pic.mask) {

					placeMask(message.pic.mask);
						
			    } else {
			    	resetCanvas()
			    }
			    if (message.pic.comments) {
			    	
			    	loadComments(message.pic.comments);
			    	hideMarkers();
			    	
			    	document.querySelector('.comment__form').classList.remove('display-block')
			    	document.querySelector('.comment__form').classList.add('display-none')
			    }
		    });
		}
		if (message.event == 'comment') {
			renderComment(message.comment);
			
		}
		        
		if (message.event == 'mask') {
			placeMask(message.url);
			
		}
	});

	wss.addEventListener('error', error => {
		console.log(`Ошибка: ${error.message}`);
	});
}


