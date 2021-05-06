const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const alert = require("alert");
const readlineSync = require('readline-sync');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

/////////////Connection part//////////////

var userName = readlineSync.question('Please input your username: ');
var password = readlineSync.question('Please input your password: ');
console.log(`So your username is ${userName} !`);
console.log(`So your password is ${password} !`);
console.log("");


var connection = mysql.createConnection({
    host: "localhost",
    user: userName,
    password: password,
    database: 'project'
});


connection.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log("success");
});


// login part
app.get("/", function (req, res) {
    res.render("login");
});

app.post("/", function (req, res){
    const code = {
        username: 'admin',
        password: 'cs5200'
    }
    const userName = req.body.username;
    const passWord = req.body.password;
    if (userName === code.username && passWord === code.password) {
        console.log(true);
        res.redirect("/main");
        // res.sendFile(__dirname + "/main.html");
    } else {
        console.log(false);
        res.redirect("/failure");
        // res.sendFile(__dirname + "/failure.html");
    }
});

app.get("/main", function (req, res) {
    res.render("main");
});

app.get("/failure", function (req, res) {
    res.render("failure");
});

app.post("/failure", function (req, res) {
    res.redirect("/");
});







/////////////player part//////////////

app.get('/player', (req, res) => {
    connection.query("SELECT * FROM project.Player_Information", function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('player', {
            result: result,
            row: result.length
        });
    });
});


// player add

app.get('/player/add', function (req, res) {
    res.render('player_add');
});

app.post('/player/add', function (req, res) {
    const num = req.body.num;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const dob = req.body.dob;
    const position = req.body.position;
    const university = req.body.university;
    const gameplayed = req.body.gameplayed;

    const judgeSql = `select num from project.Player_Information`;
    connection.query(judgeSql, function (err1, result1, fields1) {
        if (err1) {
            return console.error('error: ' + err1.message);
        }
        let count = 0;
        for (let i = 0; i < result1.length; i++) {
            if (result1[i].num != num) {
                count++;
            }
        }
        if (count === result1.length) {
            const sql = `INSERT INTO project.Player_Information (num,firstName,lastName,dob,position,university,gamePlayed) 
        VALUES (${num}, "${firstName}", "${lastName}","${dob}", "${position}", "${university}", ${gameplayed});`
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    return console.error('error: ' + err.message);
                }
            });
        } else {
            alert("There is a record related to your input. Please try again.")
        }
    });

    res.redirect("/player");
});


// player delete

app.get('/player/del/:num', function (req, res) {
    var num = req.params.num;
    connection.query('delete from project.Player_Information where num = ' + num, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/player');
        }
    });
});

// player update

app.get('/player/update/:num', function (req, res) {
    var num = req.params.num;
    connection.query('select * from project.Player_Information where num = ' + num, function (err, result) {
        res.render('player_update', {
            datas: result
        });
    });
});

app.post('/player/update', function (req, res) {
    const num = req.body.num;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const dob = req.body.dob;
    const position = req.body.position;
    const university = req.body.university;
    const gameplayed = req.body.gameplayed;
    const sql = `update project.Player_Information set 
    firstName = "${firstName}"  ,lastName = "${lastName}", 
    dob = "${dob}", position = "${position}", university = "${university}",
    gamePlayed = ${gameplayed}
    where num = ${num}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/player');
        }
    })
});











/////////////Coach part//////////////

app.get('/coach', (req, res) => {
    var sql = `SELECT * FROM project.Coach`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('coach', {
            result: result,
            row: result.length
        });
    });
});

app.post('/coach', function (req, res) {
    const year = req.body.y;
    if (!Number.isNaN(year)) {
        var sql = `call track_coach_largerNyears(${year})`;
    } else {
        var sql = "select * from project.Coach";
    }
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('coach', {
            result: result[0],
            row: result[0].length
        });
    });

});



// coach add

app.get('/coach/add', function (req, res) {
    res.render('coach_add');
});

app.post('/coach/add', function (req, res) {
    const staffNo = req.body.staffNo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const title = req.body.title;
    const years = req.body.years;
    const teamName = req.body.teamName;

    const judgeSql = `select staffNo from project.Coach`;
    connection.query(judgeSql, function (err1, result1, fields1) {
        if (err1) {
            return console.error('error: ' + err1.message);
        }
        let count = 0;
        for (let i = 0; i < result1.length; i++) {
            if (result1[i].staffNo != staffNo) {
                count++;
            }
        }
        if (count === result1.length) {
            const sql = `INSERT INTO project.Coach (staffNo,firstName,lastName,title,years,teamName) 
        VALUES (${staffNo}, "${firstName}", "${lastName}","${title}", "${years}", "${teamName}" );`
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    return console.error('error: ' + err.message);
                }
            });
        } else {
            alert("There is a record related to your input. Please try again.")
        }
    });

    res.redirect("/coach");
});


// coach delete

app.get('/coach/del/:staffNo', function (req, res) {
    var staffNo = req.params.staffNo;
    connection.query('delete from project.Coach where staffNo = ' + staffNo, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/coach');
        }
    });
});

// coach update

app.get('/coach/update/:staffNo', function (req, res) {
    var staffNo = req.params.staffNo;
    connection.query('select * from project.Coach where staffNo = ' + staffNo, function (err, result) {
        res.render('coach_update', {
            datas: result
        });
    });
});

app.post('/coach/update', function (req, res) {
    const staffNo = req.body.staffNo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const title = req.body.title;
    const years = req.body.years;
    const teamName = req.body.teamName;

    const sql = `update project.Coach set 
    firstName = "${firstName}"  ,lastName = "${lastName}", 
    title = "${title}", years = ${years}, teamName = "${teamName}"
    where staffNo = ${staffNo}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/coach');
        }
    })
});










/////////////Calendar part//////////////

app.get('/calendar', (req, res) => {
    var sql = `SELECT * FROM project.Calendar`;
    var startDate = "2020-01-03";
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var endDate = `${year}-${month}-${day}`;

    console.log(`select countMatch("${startDate}", "${endDate}")`);
    var sqlCount = `select countMatch("${startDate}", "${endDate}")as newTable`;
 
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        connection.query(sqlCount, function (err1, result1, fields1) {
            if (err1) {
                return console.error('error: ' + err1.message);
            }
            res.render('calendar', {
                result: result,
                row: result1[0].newTable,
                count: result1[0].newTable,
                today: endDate
            });
        });

    });
});


/////////////Manager part//////////////

app.get('/manager', (req, res) => {
    var sql = `SELECT * FROM project.Manager`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('manager', {
            result: result,
            row: result.length
        });
    });
});
// manager add

app.get('/manager/add', function (req, res) {
    res.render('manager_add');
});

app.post('/manager/add', function (req, res) {
    const staffNo = req.body.staffNo;
    const managerNo = req.body.managerNo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const title = req.body.title;
    const teamName = req.body.teamName;

    const judgeSql = `select staffNo from project.Manager`;
    connection.query(judgeSql, function (err1, result1, fields1) {
        if (err1) {
            return console.error('error: ' + err1.message);
        }
        let count = 0;
        for (let i = 0; i < result1.length; i++) {
            if (result1[i].staffNo != staffNo && result1[i].managerNo != managerNo) {
                count++;
            }
        }
        if (count === result1.length) {
            const sql = `INSERT INTO project.Manager (staffNo,managerNo,firstName,lastName,title,teamName) 
        VALUES (${staffNo}, ${managerNo}, "${firstName}", "${lastName}","${title}", "${teamName}");`
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    return console.error('error: ' + err.message);
                }
            });
        } else {
            alert("There is a record related to your input. Please try again.")
        }
    });

    res.redirect("/manager");
});


//manager delete

app.get('/manager/del/:staffNo', function (req, res) {
    var staffNo = req.params.staffNo;
    connection.query('delete from project.Manager where staffNo = ' + staffNo, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/manager');
        }
    });
});

// manager update

app.get('/manager/update/:staffNo', function (req, res) {
    var staffNo = req.params.staffNo;
    connection.query('select * from project.Manager where staffNo = ' + staffNo, function (err, result) {
        res.render('manager_update', {
            datas: result
        });
    });
});

app.post('/manager/update', function (req, res) {
    const staffNo = req.body.staffNo;
    const managerNo = req.body.managerNo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const title = req.body.title;
    const teamName = req.body.teamName;

    const sql = `update project.Manager set 
    managerNo = ${managerNo}, firstName = "${firstName}"  ,lastName = "${lastName}", 
    title = "${title}", teamName = "${teamName}"
    where staffNo = ${staffNo}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/manager');
        }
    })
});



/////////////Sponser part//////////////


app.get('/sponser', (req, res) => {
    var sql = `SELECT * FROM project.Sponser`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('sponser', {
            result: result,
            row: result.length
        });
    });
});


// sponser add

app.get('/sponser/add', function (req, res) {
    res.render('sponser_add');
});

app.post('/sponser/add', function (req, res) {
    const sponserID = req.body.sponserID;
    const name = req.body.name;
    const startTime = req.body.startTime;
    const teamName = req.body.teamName;

    const judgeSql = `select sponserID from project.Sponser`;
    connection.query(judgeSql, function (err1, result1, fields1) {
        if (err1) {
            return console.error('error: ' + err1.message);
        }
        let count = 0;
        for (let i = 0; i < result1.length; i++) {
            if (result1[i].sponserID != sponserID) {
                count++;
            }
        }
        if (count === result1.length) {
            const sql = `INSERT INTO project.Sponser (sponserID,name,startTime,teamName) 
        VALUES (${sponserID}, "${name}", "${startTime}", "${teamName}");`
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    return console.error('error: ' + err.message);
                }
            });
        } else {
            alert("There is a record related to your input. Please try again.")
        }
    });

    res.redirect("/sponser");
});


//sponser delete

app.get('/sponser/del/:sponserID', function (req, res) {
    var sponserID = req.params.sponserID;
    connection.query('delete from project.Sponser where sponserID = ' + sponserID, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/sponser');
        }
    });
});

// sponser update

app.get('/sponser/update/:sponserID', function (req, res) {
    var sponserID = req.params.sponserID;
    connection.query('select * from project.Sponser where sponserID = ' + sponserID, function (err, result) {
        res.render('sponser_update', {
            datas: result
        });
    });
});

app.post('/sponser/update', function (req, res) {
    const sponserID = req.body.sponserID;
    const name = req.body.name;
    const startTime = req.body.startTime;
    const teamName = req.body.teamName;

    const sql = `update project.Sponser set 
    name = "${name}", startTime = "${startTime}", teamName = "${teamName}"
    where sponserID = ${sponserID}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/sponser');
        }
    })
});








/////////////Staff part//////////////

app.get('/staff', (req, res) => {
    var sql = `SELECT * FROM project.Staff`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('staff', {
            result: result,
            row: result.length
        });
    });
});

app.post('/staff', function (req, res) {
    const limit = req.body.limit;
    if (!Number.isNaN(limit)) {
        var sql = `call limit_staff(${limit})`;
    } else {
        var sql = `SELECT * FROM project.Staff`;
    }
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('staff', {
            result: result[0],
            row: result[0].length
        });
    });

});

// staff add

app.get('/staff/add', function (req, res) {
    res.render('staff_add');
});

app.post('/staff/add', function (req, res) {
    const staffNo = req.body.staffNo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const title = req.body.title;
    const teamName = req.body.teamName;
    const playerID = req.body.playerID;

    const judgeSql = `select staffNo from project.Staff`;
    connection.query(judgeSql, function (err1, result1, fields1) {
        if (err1) {
            return console.error('error: ' + err1.message);
        }
        let count = 0;
        for (let i = 0; i < result1.length; i++) {
            if (result1[i].staffNo != staffNo) {
                count++;
            }
        }
        if (count === result1.length) {
            const sql = `INSERT INTO project.Staff (staffNo,firstName,lastName,title,teamName,playerID) 
        VALUES (${staffNo}, "${firstName}", "${lastName}","${title}", "${teamName}", "${playerID}");`
            connection.query(sql, function (err, result, fields) {
                if (err) {
                    return console.error('error: ' + err.message);
                }
            });
        } else {
            alert("There is a record related to your input. Please try again.")
        }
    });

    res.redirect("/staff");
});


//staff delete

app.get('/staff/del/:staffNo', function (req, res) {
    var staffNo = req.params.staffNo;
    connection.query('delete from project.Staff where staffNo = ' + staffNo, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/staff');
        }
    });
});

// staff update

app.get('/staff/update/:staffNo', function (req, res) {
    var staffNo = req.params.staffNo;
    connection.query('select * from project.Staff where staffNo = ' + staffNo, function (err, result) {
        res.render('staff_update', {
            datas: result
        });
    });
});

app.post('/staff/update', function (req, res) {
    const staffNo = req.body.staffNo;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const title = req.body.title;
    const teamName = req.body.teamName;
    const playerID = req.body.playerID;

    const sql = `update project.Staff set 
    firstName = "${firstName}"  ,lastName = "${lastName}", 
    title = "${title}", teamName = "${teamName}",
    playerID = ${playerID}
    where staffNo = ${staffNo}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/staff');
        }
    })
});


/////////////Team part//////////////

app.get('/team', (req, res) => {
    var sql = `SELECT * FROM project.Team`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('team', {
            result: result,
            row: result.length
        });
    });
});


/////////////Score part//////////////

app.get('/score', (req, res) => {
    var sql = `SELECT * FROM project.Scoring`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('score', {
            result: result,
            row: result.length
        });
    });
});


//score delete
app.get('/score/del/:playerNum', function (req, res) {
    var playerNum = req.params.playerNum;
    connection.query('delete from project.Scoring where playerNum = ' + playerNum, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/score');
        }
    });
});

// score update

app.get('/score/update/:playerNum', function (req, res) {
    var playerNum = req.params.playerNum;
    connection.query('select * from project.Scoring where playerNum = ' + playerNum, function (err, result) {
        res.render('score_update', {
            datas: result
        });
    });
});

app.post('/score/update', function (req, res) {
    const playerNum = req.body.playerNum;
    const GP = req.body.GP;
    const GS = req.body.GS;
    const MPG = req.body.MPG;
    const PPG = req.body.PPG;
    const FGM = req.body.FGM;
    const FGA = req.body.FGA;
    const FGper = req.body.FGper;
    const FGM_3 = req.body.FGM_3;
    const FGMper_3 = req.body.FGMper_3;
    const FTM = req.body.FTM;
    const FTA = req.body.FTA;
    const FTper = req.body.FTper;

    const sql = `update project.Scoring set 
    GP = ${GP}  ,GS = ${GS},  MPG = ${MPG},
    PPG = ${PPG}, FGM = ${FGM}, FGA = ${FGA}, FGper = ${FGper},
    FGM_3 = ${FGM_3}, FGMper_3 = ${FGMper_3}, FTM = ${FTM}, FTA = ${FTA},
    FTper = ${FTper}
    where playerNum = ${playerNum}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/score');
        }
    })
});


/////////////Defence part//////////////

app.get('/defence', (req, res) => {
    var sql = `SELECT * FROM project.Defence`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('defence', {
            result: result,
            row: result.length
        });
    });
});


//defence delete
app.get('/defence/del/:playerNum', function (req, res) {
    var playerNum = req.params.playerNum;
    connection.query('delete from project.Defence where playerNum = ' + playerNum, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/defence');
        }
    });
});

// defence update

app.get('/defence/update/:playerNum', function (req, res) {
    var playerNum = req.params.playerNum;
    connection.query('select * from project.Defence where playerNum = ' + playerNum, function (err, result) {
        res.render('defence_update', {
            datas: result
        });
    });
});

app.post('/defence/update', function (req, res) {

    const playerNum = req.body.playerNum;
    const GP = req.body.GP;
    const GS = req.body.GS;
    const OREB = req.body.OREB;
    const DREB = req.body.DREB;
    const REB = req.body.REB;
    const RPG = req.body.RPG;
    const STL = req.body.STL;
    const SPG = req.body.SPG;
    const BLK = req.body.BLK;
    const BPG = req.body.BPG;


    const sql = `update project.Defence set 
    GP = ${GP}  ,GS = ${GS},  OREB = ${OREB},
    DREB = ${DREB}, REB = ${REB}, RPG = ${RPG}, STL = ${STL},
    SPG = ${SPG}, BLK = ${BLK}, BPG = ${BPG}
    where playerNum = ${playerNum}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/defence');
        }
    })
});



/////////////Assist part//////////////

app.get('/assist', (req, res) => {
    var sql = `SELECT * FROM project.Assist`
    connection.query(sql, function (err, result, fields) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        res.render('assist', {
            result: result,
            row: result.length
        });
    });
});


//assist delete
app.get('/assist/del/:playerNum', function (req, res) {
    var playerNum = req.params.playerNum;
    connection.query('delete from project.Assist where playerNum = ' + playerNum, function (err, result) {
        if (err) {
            res.send('delete error: ' + err);
        } else {
            res.redirect('/assist');
        }
    });
});

// assist update
app.get('/assist/update/:playerNum', function (req, res) {
    var playerNum = req.params.playerNum;
    connection.query('select * from project.Assist where playerNum = ' + playerNum, function (err, result) {
        res.render('assist_update', {
            datas: result
        });
    });
});

app.post('/assist/update', function (req, res) {

    const playerNum = req.body.playerNum;
    const GP = req.body.GP;
    const GS = req.body.GS;
    const AST = req.body.AST;
    const APG = req.body.APG;
    const TOPG = req.body.TOPG;
    const ATO = req.body.ATO;

    const sql = `update project.Assist set 
    GP = ${GP}  ,GS = ${GS},  AST = ${AST},
    APG = ${APG}, TOPG = ${TOPG}, ATO = ${ATO}
    where playerNum = ${playerNum}`

    connection.query(sql, function (err, result) {
        if (err) {
            res.send('update error: ' + err);
        } else {
            res.redirect('/assist');
        }
    })
});






app.listen(3000, function () {
    console.log("server is running at 3000 port");
});