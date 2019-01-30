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

let wss, response, id;


if (localStorage.getItem('posX')) {
	menu.style.top = `${localStorage.getItem('posY')}`
	menu.style.left = `${localStorage.getItem('posX')}`

}

app.removeChild(commentsForm);


image.style.display = 'none';
image.style.position = 'relative'
image.style.top = '0'
image.style.left = '0'
image.style.transform = 'initial'
burger.style.display = 'none';
share.style.display = 'none';

comments.style.display = 'none';
draw.style.display = 'none';

const imageWrap = document.createElement('div');
let mask = document.createElement('canvas'),
	canvas = document.createElement('canvas');

resetComment();

mask.style.position = 'absolute'
mask.style.top = '0'
mask.style.left = '0'
mask.style.zIndex = '50'
canvas.style.position = 'absolute'
canvas.style.top = '0'
canvas.style.left = '0'


imageWrap.className = 'image-wrap';
mask.className = 'mask';
canvas.className = 'canvas';
imageWrap.style.position = 'absolute'
imageWrap.style.top = '50%'
imageWrap.style.left = '50%'
imageWrap.style.transform = 'translate(-50%, -50%)'

app.appendChild(imageWrap);
imageWrap.appendChild(image);
imageWrap.appendChild(mask);
imageWrap.appendChild(canvas);

app.addEventListener('drop', dropFiles);
app.addEventListener('dragover', event => event.preventDefault());

init()

function dropFiles(event) {
	event.preventDefault();
	if (image.style.display == 'none') {
		let file = event.dataTransfer.files[0];
		if ((file.type === 'image/png') || (file.type === 'image/jpeg')) {
			err.style.display = 'none';
			sendFile(file);
		} else {
			err.style.display = 'initial';
		}	
	} else {
		err.style.display = 'initial';
		err.style.zIndex = '10';
		document.querySelector('.error__message').textContent 
		= 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню';
		document.addEventListener('click', () => {
			err.style.display = 'none';
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
	burger.style.display = 'none';
	drawTools.style.display = 'none';
	commentsTools.style.display = 'none';
	shareTools.style.display = 'none';
	newImg.style.display = 'inline-block';
	comments.style.display = 'inline-block';
	draw.style.display = 'inline-block';
	share.style.display = 'inline-block';
});

comments.addEventListener('click', () => {
	newImg.style.display = 'none';
	draw.style.display = 'none';
	share.style.display = 'none';
	canvas.style.zIndex = 10;
	mask.style.zIndex = 20;	
	burger.style.display = 'inline-block';
	commentsTools.style.display = 'inline-block';
	
});

share.addEventListener('click', () => {
	if (shareTools.style.display == 'inline-block') {
		share.style.display = 'none';
		shareTools.style.display = 'none';
		burger.style.display = 'inline-block';
		comments.style.display = 'inline-block';
		commentsTools.style.display = 'inline-block';	
	} else {
		newImg.style.display = 'none';
		comments.style.display = 'none';
		draw.style.display = 'none';
		burger.style.display = 'inline-block';
		shareTools.style.display = 'inline-block';
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
    floatMenu.style.whiteSpace = 'nowrap';
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
	newImg.style.display = 'none';
	comments.style.display = 'none';
	share.style.display = 'none';
	mask.style.zIndex = 10;
	canvas.style.zIndex = 20;
	burger.style.display = 'inline-block';
	drawTools.style.display = 'inline-block';
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

	canvas.addEventListener('mousedown', (event) => { 
		if (drawTools.style.display == 'inline-block') {
			drawing = true;
	  		const curve = [];
			curve.push([event.offsetX, event.offsetY]);
			curves.push(curve);
			isRepaint = true;
		}  
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

	canvas.addEventListener('mousemove', (event) => {
	    if (drawing) { 
	      const point = [event.offsetX, event.offsetY];
	      curves[curves.length - 1].push(point);
	      isRepaint = true;
	    }
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

commentForm.style.display = 'none';

commentForm.style.position = 'absolute'
commentLoader.style.display = 'none';

mask.addEventListener('click', event => {


	if (commentsTools.style.display == 'inline-block' && commentsOn.checked) {		
		const markers = document.querySelectorAll('.comments__marker-checkbox');
		for (const marker of markers) {
			marker.checked = false;

		}

		commentForm.style.top = `${event.offsetY - 14}px`;
		commentForm.style.left = `${event.offsetX - 22}px`;
		commentForm.style.display = 'initial';
		

		commentForm.querySelector('.comment__loader').style.display = 'none';
		commentForm.querySelector('.comments__marker-checkbox').checked = true;
		commentForm.querySelector('.comments__input').focus();
		commentForm.style.zIndex = 100;
		

		commentForm.querySelector('.comments__close').addEventListener('click', event => {

			commentForm.querySelector('.comments__marker-checkbox').checked = false;

			if(!commentForm.querySelector('.comment__message').textContent) {
				commentForm.style.display = 'none';
			}
		});
	}
});

app.addEventListener('submit', event => {
	event.preventDefault();
	event.target.querySelector('.comment__loader').style.display = 'initial';
	


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
    	currentFormNode.querySelector('.comment__loader').style.display = 'none';	
    	renderNewCommentElement(currentFormNode, comment);
	} else {
    	placeComment(comment);
	}; 
};

function placeComment(comment) {
	const commentsFormSimple = commentForm;
	const commentEl = commentsFormSimple.cloneNode(true);
	commentEl.style.display = 'initial';
    commentEl.style.top = `${comment.top}px`;
    commentEl.style.left = `${comment.left}px`;
    commentEl.dataset.top = comment.top;
    commentEl.dataset.left = comment.left;
	commentEl.querySelector('.comment__loader').style.display = 'none';		
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
			cmnt.style.display = 'block';
		} else {
			cmnt.style.display = 'none';
		}
	})
}

//server

function init() {
	
	if (window.location.href.indexOf('?id=') !== -1) {
    image.src = localStorage.getItem('saveImg');
    id = localStorage.getItem('saveId');
    image.style.display = 'inline-block';
	burger.style.display = 'inline-block';
    comments.style.display = 'inline-block';
	commentsTools.style.display = 'inline-block';
	newImg.style.display = 'none';

	setTimeout(function() {
		mask.width = image.clientWidth
		mask.height = image.clientHeight;
		// document.querySelector('.comment__form').style.display = 'none';
		// const markers = document.querySelectorAll('.comments__marker-checkbox');
		// for (const marker of markers) {
		// 	marker.checked = false;
		// }
	}, 2000);
	
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
		image.style.display = 'none';
		imageLoader.style.display = 'initial';
	});

	xhr.addEventListener('loadend', () => {
		imageLoader.style.display = 'none'
		
		
	});

	xhr.addEventListener('load', () => {
		if (xhr.status === 200) {
			init()
			response = JSON.parse(xhr.responseText);
			console.log(response);

			id = response.id;
			newImg.style.display = 'none';
			comments.style.display = 'none';
			draw.style.display = 'none';
			burger.style.display = 'inline-block';
			share.style.display = 'inline-block';
			shareTools.style.display = 'inline-block';
			host = `${window.location.origin}${window.location.pathname}?id=${id}`;
    		localStorage.host = host;
    		menuUrl.value = host;

			setTimeout(function() {
				mask.width = image.clientWidth;
				mask.height = image.clientHeight;
				document.querySelector('.comment__form').style.display = 'none';
				const markers = document.querySelectorAll('.comments__marker-checkbox');
				for (const marker of markers) {
					marker.checked = false;
				}
				
				resetComment();
				resetCanvas();
			}, 2000);

			socketConnect();
			history.pushState(null, null, host);
		}
	});

	xhr.send(formData);
}

function socketConnect() {
	wss = new WebSocket(`wss://neto-api.herokuapp.com/pic/${id}`);

	wss.addEventListener('open', () => {
		console.log('Есть коннект');
	});

	wss.addEventListener('message', event => {
		let message = JSON.parse(event.data);
		console.log(message);

		if (message.event == 'pic') {
			localStorage.setItem('saveImg', message.pic.url);
			localStorage.setItem('saveId', message.pic.id);
			image.src = message.pic.url;
			image.style.display = 'initial';



		    image.addEventListener('load', () => {
				if (message.pic.mask) {
					setTimeout(function() {
						placeMask(message.pic.mask);
						
					}, 1000);
					
			    } else {
			    	resetCanvas()
			    }
			    if (message.pic.comments) {
			    	const markers = document.querySelectorAll('.comments__marker-checkbox');
					for (const marker of markers) {
						marker.checked = false;
					}
			    	loadComments(message.pic.comments);
			    	
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
