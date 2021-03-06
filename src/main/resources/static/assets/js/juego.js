/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var stompClient = null;
var context;
var obstacles = [];
var fondo;
var folderImage = "/game/characters/";

var centesimas = 0;
var segundos = 0;
var minutos = 0;
var horas = 0;

//Player Data
var myGamePiece;
var color = null;
var posX = null;
var posY = null;
var direccion = null;
var username = null;

//Rivals Data
var competitors = [];
var rivals = [];

function connect() {
    var socket = new SockJS('/stompendpoint');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/myCharacter', function (data) {
            var charUpdate = JSON.parse(data.body);
            for (var i = 0; i < rivals.length; i++) {
                if (rivals[i].user === charUpdate['user']) {
                    rivals[i].x = charUpdate['posX'];
                    rivals[i].y = charUpdate['posY'];
                    rivals[i].image.src = charUpdate['image'];
                }
            }

        });
        stompClient.subscribe('/topic/myPos.' + localStorage.getItem("idRoom"), function (data) {
            var charUpdate = JSON.parse(data.body);
            var ind = charUpdate['ind'];
            var myColor = charUpdate['posColor'];
            obstacles[ind].image.src = folderImage + "caja" + myColor + ".png";

        });

        stompClient.subscribe('/topic/wininroom.' + localStorage.getItem("idRoom"), function (data) {
            alert(data.body);
            window.location = "../";

        });

        stompClient.subscribe('/topic/endGame.' + localStorage.getItem("idRoom"), function (data) {
            var myBoxes = 0;
            for (var i = 0; i < obstacles.length; i++) {
                if (obstacles[i].image.src.includes(color)) {
                    myBoxes++;
                }
            }
            console.log(myBoxes);
            infom = {"name": username, "score": myBoxes};
            stompClient.send('/app/' + localStorage.getItem("idRoom") + '/winnner', {}, JSON.stringify(infom));
            alert('YA SE ACABO LA PARTIDA');
        });
    });
}

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}


function startGame() {
    myGamePiece = new component(username, 50, 50, folderImage + color + direccion + ".png", posX, posY, "image");
    fondo = new component(1150, 650, "/resources/images/fondo1.png", 0, 0, "image");
    for (var i = 0; i < competitors.length; i++) {
        rivals.push(new component(competitors[i].name, 50, 50, folderImage + competitors[i].color + direccion + ".png", competitors[i].posX, competitors[i].posY, "image"));
    }

    //Floor
    for (var i = 0; i < 22; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", i * 50, 600, "image"));
    }

    //Left wall
    for (var i = 0; i < 13; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 0, 50 * i, "image"));
    }

    //Right wall
    for (var i = 0; i < 13; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 1100, 50 * i, "image"));
    }

    //Platform Lvl 1
    for (var i = 3; i < 7; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 50 * i, 450, "image"));
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 1100 - 50 * i, 450, "image"));
    }

    //Platform Triangle Form
    obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 450, 450, "image"));
    obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 650, 450, "image"));

    obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 500, 400, "image"));
    obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 600, 400, "image"));

    obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 550, 350, "image"));

    //Platform Lvl 2
    for (var i = 1; i < 4; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 50 * i, 300, "image"));
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 1100 - (50 * i), 300, "image"));

    }

    //Platform Lvl 3 Center
    for (var i = 0; i < 11; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 300 + (50 * i), 150, "image"));
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 300 + (50 * i), 150, "image"));
    }

    //Platform Lvl 3 Left and Right
    for (var i = 0; i < 2; i++) {
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 50 + (50 * i), 100 + (50 * i), "image"));
        obstacles.push(new component("plataforma", 50, 50, folderImage + "caja.png", 1100 - (50 + (50 * i)), 100 + (50 * i), "image"));
    }
    myGameArea.start();
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = 1150;
        this.canvas.height = 650;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
    },
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(user, width, height, color, x, y, type) {
    this.user = user;
    this.type = type;
    if (type == "image") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.grounded = false; //inicia false si el jugador esta en el aire sino true
    this.gravity = 0.1;
    this.gravitySpeed = 0;
    this.friction = 0.8;
    this.jumping = true; //inicia saltando valor true sino false

    this.clear = function () {
        ctx = myGameArea.context;
        ctx.clearRect(this.x, this.y, this.width, this.height)

    }

    this.update = function () {
        ctx = myGameArea.context;
        if (type == "image") {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    this.newPos = function () {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
        this.hitup();

    }

    this.hitBottom = function () {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
            this.jumping = false;
            this.grounded = true;
        }
    }

    this.hitup = function () {
        if (this.y < 0) {
            this.y = 0;
        }
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.newPos();
    myGamePiece.update();

    myGamePiece.grounded = false;
    for (var i = 0; i < obstacles.length; i++) {

        var dir = colCheck(myGamePiece, obstacles[i]);

        if (dir === "l" || dir === "r") {
            myGamePiece.speedX = 0;
            myGamePiece.jumping = false;
        } else if (dir === "b") {
            if (myGamePiece.speedY != 0 || myGamePiece.speedX != 0) {
                stompClient.send('/topic/myPos.' + localStorage.getItem("idRoom"), {}, JSON.stringify({'ind': i, 'posColor': color}));
            }
            myGamePiece.grounded = true;
            myGamePiece.jumping = false;
        } else if (dir === "t") {
            myGamePiece.speedY *= -1;
        }
        obstacles[i].update();
    }

    if (myGamePiece.grounded) {
        myGamePiece.speedY = 0;
        myGamePiece.gravitySpeed = 0;
    }

    for (var i = 0; i < rivals.length; i++) {
        rivals[i].update();
    }
    if (!myGamePiece.grounded || myGamePiece.speedY != 0 || myGamePiece.speedX != 0) {
        stompClient.send('/topic/myCharacter', {}, JSON.stringify({'user': myGamePiece.user, 'posX': myGamePiece.x, 'posY': myGamePiece.y, 'image': myGamePiece.image.src}));
    }

}

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
            vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            colDir = null;

    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                shapeA.y += oY;
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}


function move(dir) {
    if (dir == "up" && !myGamePiece.jumping && myGamePiece.grounded) {
        myGamePiece.jumping = true;
        myGamePiece.grounded = false;
        myGamePiece.speedY = -7;
    }
    if (dir == "left") {
        direccion = "Left";
        myGamePiece.image.src = folderImage + color + direccion + ".png";
        myGamePiece.speedX = -5;
    }
    if (dir == "right") {
        direccion = "Right";
        myGamePiece.image.src = folderImage + color + direccion + ".png";
        myGamePiece.speedX = 5;
    }

}

function clearmove() {
    myGamePiece.image.src = folderImage + color + direccion + ".png";
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}

function inicio() {
    control = setInterval(cronometro, 10);
}

function cronometro() {
    if (centesimas < 99) {
        centesimas++;
        if (centesimas < 10) {
            centesimas = "0" + centesimas
        }
    }
    if (centesimas == 99) {
        centesimas = -1;
    }
    if (centesimas == 0) {
        segundos++;
        if (segundos < 10) {
            segundos = "0" + segundos
        }
        Segundos.innerHTML = "Tiempo "+minutos+":" + segundos;
    }
    if (segundos == 59) {
        segundos = -1;
    }
    if ((centesimas == 0) && (segundos == 0)) {
        minutos++;
        if (minutos < 10) {
            minutos = "0" + minutos
        }
        Segundos.innerHTML = "Tiempo "+minutos+":" + segundos;
    }
    if (minutos == 59) {
        minutos = -1;
    }
    if ((centesimas == 0) && (segundos == 0) && (minutos == 0)) {
        horas++;
        if (horas < 10) {
            horas = "0" + horas
        }
    }
}

$(document).ready(
        function () {
            connect();
            username = localStorage.getItem('username');
            direcciones = ["Right", "Left"];
            var randomDireccion = Math.floor((Math.random() * 2) + 0);
            direccion = direcciones[randomDireccion];
            var coloresJugadores = ["Rojo", "Azul", "Amarillo", "Verde", "Fantasma", "Morado", "Naranja"];
            var coloresDisponibles = coloresJugadores.length;
            var randomcolor = Math.floor((Math.random() * coloresDisponibles) + 0);
            color = coloresJugadores[randomcolor];

            $("#estilo").append("canvas {\n\
            height: 75%;\n\
            width: 75%;\n\
            border:1px solid #d3d3d3;\n\
            background-color: #f1f1f1;}");
            $("#formulario").remove();

            document.addEventListener('keydown', function (event) {
                keyCode = event.keyCode;
                if (keyCode == 39) {
                    move('right')
                }
                if (keyCode == 37) {
                    move('left')
                }
                if (keyCode == 38 || keyCode == 32) {
                    move('up')
                }
            }, false);
            document.addEventListener('keyup', function (event) {
                clearmove();
            }, false);

            $.get("/otros/participantsinroom/" + localStorage.getItem("idRoom"), function (data) {
                for (var i in data) {
                    if (data[i].name == username) {
                        color = data[i].color;
                        posX = data[i].posX;
                        posY = data[i].posY;
                    } else {
                        competitors.push(data[i]);
                    }
                }
                startGame();
                inicio();

            });
        }
);
