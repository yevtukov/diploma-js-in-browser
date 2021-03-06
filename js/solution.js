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

const imageWrap = document.querySelector('.image-wrap');
let mask = document.querySelector('.mask'),
	canvas = document.querySelector('.canvas');

resetComment();

app.addEventListener('drop', dropFiles);
app.addEventListener('dragover', event => event.preventDefault());

function dropFiles(event) {
	event.preventDefault();
	if (!isLoad) {
		let file = event.dataTransfer.files[0];
		if ((file.type === 'image/png') || (file.type === 'image/jpeg')) {
			
			err.classList.remove('visible-init');
			err.classList.add('hidden');
			sendFile(file);
		} else {
			
			err.classList.remove('hidden');
			err.classList.add('visible-init');
		}	
	} else {
		err.classList.remove('hidden');
		err.classList.add('visible-init');
		err.classList.add('z-index-10');
		document.querySelector('.error__message').textContent = 'Чтобы загрузить новое изображение, пожалуйста, воспользуйтесь пунктом "Загрузить новое" в меню';
	}		
}

document.addEventListener('click', () => {
	if(!err.classList.contains('visible-init')) return; 
		err.classList.remove('visible-init');
		err.classList.add('hidden');	
});

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
	comments.forEach(comment => 
		comment.remove()
	)	
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

	burger.classList.remove('visible-inline-block');
	burger.classList.add('hidden');
	drawTools.classList.remove('visible-inline-block');
	drawTools.classList.add('hidden');
	isDrawToolsVisible = false;
	commentsTools.classList.remove('visible-inline-block');
	commentsTools.classList.add('hidden');
	isCommentsToolsVisible = false;
	shareTools.classList.remove('visible-inline-block');
	shareTools.classList.add('hidden');
	isShareToolsVisible = false;
	newImg.classList.remove('hidden');
	newImg.classList.add('visible-inline-block');
	comments.classList.remove('hidden');
	comments.classList.add('visible-inline-block');
	draw.classList.remove('hidden');
	draw.classList.add('visible-inline-block');
	share.classList.remove('hidden');
	share.classList.add('visible-inline-block');

});

comments.addEventListener('click', () => {

	newImg.classList.remove('visible-inline-block');
	newImg.classList.add('hidden');
	draw.classList.remove('visible-inline-block');
	draw.classList.add('hidden');
	share.classList.remove('visible-inline-block');
	share.classList.add('hidden');
	burger.classList.remove('hidden');
	burger.classList.add('visible-inline-block');
	commentsTools.classList.remove('hidden');
	commentsTools.classList.add('visible-inline-block');

	canvas.classList.remove('z-index-20');
	canvas.classList.add('z-index-10');
	mask.classList.remove('z-index-10');
	mask.classList.add('z-index-20');	
	
	isCommentsToolsVisible = true;
});

share.addEventListener('click', () => {

	if (!isShareToolsVisible) {
		newImg.classList.remove('visible-inline-block');
		newImg.classList.add('hidden');
		comments.classList.remove('visible-inline-block');
		comments.classList.add('hidden');
		draw.classList.remove('visible-inline-block');
		draw.classList.add('hidden');
		burger.classList.remove('hidden');
		burger.classList.add('visible-inline-block');
		shareTools.classList.remove('hidden');
		shareTools.classList.add('visible-inline-block');

		isShareToolsVisible = true;	
	} else {
		share.classList.remove('visible-inline-block');
		share.classList.add('hidden');
		shareTools.classList.remove('visible-inline-block');
		shareTools.classList.add('hidden');
		burger.classList.remove('hidden');
		burger.classList.add('visible-inline-block');
		comments.classList.remove('hidden');
		comments.classList.add('visible-inline-block');
		commentsTools.classList.remove('hidden');
		commentsTools.classList.add('visible-inline-block');

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

	newImg.classList.remove('visible-inline-block');
	newImg.classList.add('hidden');
	comments.classList.remove('visible-inline-block');
	comments.classList.add('hidden');
	share.classList.remove('visible-inline-block');
	share.classList.add('hidden');
	burger.classList.remove('hidden');
	burger.classList.add('visible-inline-block');
	drawTools.classList.remove('hidden');
	drawTools.classList.add('visible-inline-block');
	canvas.classList.remove('z-index-10');
	canvas.classList.add('z-index-20');
	mask.classList.remove('z-index-20');
	mask.classList.add('z-index-10');
	
	isDrawToolsVisible = true;
	canvas.width = image.width;
	canvas.height = image.height;
		
	const ctx = canvas.getContext('2d'), brushSize = 4;
	let currentColor = '#6cbe47', curves = [], drawing = false, isRepaint = false;

	document.querySelector('.red').dataset.color = '#ea5d56';
	document.querySelector('.yellow').dataset.color = '#f3d135';
	document.querySelector('.green').dataset.color = '#6cbe47';
	document.querySelector('.blue').dataset.color = '#53a7f5';
	document.querySelector('.purple').dataset.color = '#b36ade';

	document.querySelector('.draw-tools').addEventListener('click', (event) => {
		currentColor = event.target.dataset.color
	})

	function smoothCurveBetween (p1, p2) {
	    const cp = p1.map((coord, index) => (coord + p2[index]) / 2);
	    ctx.quadraticCurveTo(...p1, ...cp);
	}

	function smoothCurve(points) {
	    ctx.beginPath();
	    ctx.lineWidth = brushSize;
	    ctx.strokeStyle = currentColor;
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

const commentForm = commentsForm.cloneNode(true);
imageWrap.appendChild(commentForm);
commentForm.classList.add('hidden');
commentForm.classList.add('position-abs');
commentForm.classList.add('z-index-100');
document.querySelector('.comment__loader').classList.add('hidden');

init()

function hideMarkers() {
	const markers = document.querySelectorAll('.comments__marker-checkbox');
		for (const marker of markers) {
			marker.checked = false;
		}
}

mask.addEventListener('click', event => {

	if (!isCommentsToolsVisible && commentsOn.checked) return; 	

		hideMarkers();
		
		commentForm.style.top = `${event.offsetY - 14}px`;
		commentForm.style.left = `${event.offsetX - 22}px`;
		commentForm.classList.remove('hidden');
		commentForm.classList.add('visible-init');
		commentForm.querySelector('.comment__loader').classList.remove('visible-init');
		commentForm.querySelector('.comment__loader').classList.add('hidden');
		commentForm.querySelector('.comments__marker-checkbox').checked = true;
		commentForm.querySelector('.comments__input').focus();
		commentForm.querySelector('.comment__message').textContent = '';

		commentForm.querySelector('.comments__close').addEventListener('click', event => {

			commentForm.querySelector('.comments__marker-checkbox').checked = false;

			if(!commentForm.querySelector('.comment__message').textContent) {
				commentForm.classList.remove('visible-init');
				commentForm.classList.remove('visible-block');
				commentForm.classList.add('hidden');
				
			}
		});
});

app.addEventListener('submit', event => {
	event.preventDefault();
	event.target.querySelector('.comment__loader').classList.remove('hidden');
	event.target.querySelector('.comment__loader').classList.add('visible-init');
	event.target.querySelector('.comments__marker-checkbox').checked = true;
		

	const input = event.target.querySelector('.comments__input'),
		comment = {
			'message' : input.value, 
			'left' : parseInt(event.target.style.left), 
			'top' : parseInt(event.target.style.top)
		};                                               
	
	sendComment(comment); 
	
});

function sendComment(comment) {

	document.querySelector('.comments__input').value = '';
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
    	let currentComment = {
    		message: comments[comment].message,
        	left: comments[comment].left,
        	top: comments[comment].top
        };                  
    	renderComment(currentComment);
  }

};

function renderComment(comment) {
	const currentFormNode = document.querySelector(`.comments__form[data-left='${comment.left}'][data-top='${comment.top}']`);
	if (currentFormNode) { 
    	currentFormNode.querySelector('.comment__loader').classList.remove('visible-init')	
    	currentFormNode.querySelector('.comment__loader').classList.add('hidden')	
    	renderNewCommentElement(currentFormNode, comment);
    	document.querySelector('.comments__form').classList.remove('visible-block')
    	document.querySelector('.comments__form').classList.add('hidden')
	} else {
    	placeComment(comment);
	}; 

};

function placeComment(comment) {
	const commentsFormSimple = commentForm;
	const commentEl = commentsFormSimple.cloneNode(true);
	
	commentEl.classList.remove('hidden');
	commentEl.classList.add('visible-init');
    commentEl.style.top = `${comment.top}px`;
    commentEl.style.left = `${comment.left}px`;
    commentEl.dataset.top = comment.top;
    commentEl.dataset.left = comment.left;
	commentEl.querySelector('.comment__loader').classList.remove('visible-init')
	commentEl.querySelector('.comment__loader').classList.add('hidden')		
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

	const cmntsForm = document.querySelectorAll('.comments__form')
	
	cmntsForm.forEach(cmnt => {

		if (commentsOn.checked) {
			cmnt.classList.remove('hidden');
			cmnt.classList.remove('visible-init');
			cmnt.classList.add('visible-block');
			
		} else {
			cmnt.classList.remove('visible-block');
			cmnt.classList.remove('visible-init');
			cmnt.classList.add('hidden');
		}
	})
}

//server

function init() {
	
	if (!(window.location.href.indexOf('?id=') !== -1)) return;
    image.src = localStorage.getItem('saveImg');
    id = localStorage.getItem('saveId');

	burger.classList.remove('hidden');
	burger.classList.add('visible-inline-block');
	comments.classList.remove('hidden');
	comments.classList.add('visible-inline-block');
	commentsTools.classList.remove('hidden');
	commentsTools.classList.add('visible-inline-block');
	newImg.classList.remove('visible-inline-block');
	newImg.classList.add('hidden');
	isCommentsToolsVisible = true;
	menuUrl.value= window.location.href;

	document.querySelectorAll('.comments__form').forEach(com => {
		com.classList.add('hidden')
	})

	hideMarkers();
	socketConnect();
}

let host

function sendFile(file) {

	const formData = new FormData();
	formData.append('title', file.name);
	formData.append('image', file);

	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://neto-api.herokuapp.com/pic');
	xhr.addEventListener('loadstart', () => {
		
		image.classList.add('hidden')
		imageLoader.classList.remove('hidden')
		imageLoader.classList.add('visible-init')
		
	});

	xhr.addEventListener('loadend', () => {
		
		imageLoader.classList.remove('visible-init')
		imageLoader.classList.add('hidden')
		
	});

	xhr.addEventListener('load', () => {
		if (!xhr.status === 200) {return}; 
			init()
			response = JSON.parse(xhr.responseText);
			console.log(response);
			isLoad = true;

			id = response.id;
			newImg.classList.add('hidden');
			comments.classList.add('hidden');
			draw.classList.add('hidden');
			burger.classList.add('visible-inline-block');
			share.classList.add('visible-inline-block');
			shareTools.classList.add('visible-inline-block');
			
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

			document.querySelectorAll('.comments__form').forEach(com => {
				com.classList.add('hidden')
			})
			hideMarkers();
		})

		let message = JSON.parse(event.data);
		console.log(message);

		if (message.event == 'pic') {
			localStorage.setItem('saveImg', message.pic.url);
			localStorage.setItem('saveId', message.pic.id);
			image.src = message.pic.url;
			image.classList.remove('hidden');
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
			    	
			    	document.querySelector('.comments__form').classList.remove('visible-block')
			    	document.querySelector('.comments__form').classList.add('hidden')
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
