//
// # Debt manager
//
// A simple server for web application
// Start variables
var express = require('express');
var path = require('path');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

var databaseConfig = {};

// Connects to database based on enviroment
if(process.env.ENVIROMENT == "Production"){
  databaseConfig = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
  };
}else{
  databaseConfig = {
    host: process.env.IP,
    user: "caiozed",
    password: "",
    database: "c9",
    multipleStatements: true
  };
}

var con = mysql.createConnection(databaseConfig);


app.use(express.static(path.resolve(__dirname, 'client')));

// Use bodyParser for json requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Exposed api to create new users 
app.post("/new/users", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var query = "INSERT INTO users (username, password) VALUES (?, ?)";
  con.query(query, [username, password], function(error, results, fields){
    if(error){
      res.send("Outro usuário já possui este nome!");
    }else{
      res.send("Usuário criado com sucesso");
    }
  });
});

// Exposed api to edit users 
app.post("/edit/users/:id", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var id = req.params.id;
  var query = "UPDATE users SET username = ?, password = ? WHERE id = ?";
  con.query(query, [username, password, id], function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.send("Usuário criado com sucesso");
    }
  });
});


// Exposed api to delete users based on its id
app.post("/delete/users/:id", function(req, res){
  var id = req.params.id;
  var query = "DELETE FROM users WHERE id = ?";
  var query2 = "DELETE months, debts FROM months INNER JOIN debts ON months.id = debts.month_id WHERE months.user_id = ?";
  con.query(query, id, function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      con.query(query2, id, function(error, results, fields){
        if(error){
          console.log("Sql error: "+ error);
        }else{
          res.send("Deletado com sucesso");
        }
      });
    } 
  });
});

// Exposed api to send users for authentication 
app.post("/login", function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var query = "SELECT * FROM users WHERE username = ? AND password = ?";
  con.query(query, [username, password], function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.json(results);
    }
  });
});

// Exposed api to create new months 
app.post("/new/months", function(req, res){
  var date = req.body.date;
  var user_id = req.body.user_id;
  var query = "INSERT INTO months (month_date, user_id) VALUES (?, ?)";
  con.query(query, [date, user_id], function(error, results, fields){
    if(error){
      res.send("Não é permitido meses iguais");
    }else{
      res.send("Mês criado com sucesso");
    }
  });
});

// Exposed api to send months of a user
app.post("/months", function(req, res){
  var user_id = req.body.user_id;
  var query = "SELECT * FROM months WHERE user_id = ?";
  con.query(query, user_id, function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.json(results);
    }
  });
});

// Exposed api to edit months based on it id 
app.post("/edit/months/:id", function(req, res){
  var date = req.body.date;
  var id = req.params.id;
  var query = "UPDATE months SET month_date = ? WHERE id = ?";
  con.query(query, [date, id], function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.send("Mês editado com sucesso");
    }
  });
});

// Exposed api to delete months and its dependencies  
app.post("/delete/months/:id", function(req, res){
  var month_id = req.params.id;
  var query = "DELETE FROM months WHERE id = ?";
  var query2 = "DELETE FROM debts WHERE month_id = ?";
  con.query(query, month_id, function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      con.query(query2, month_id, function(error, results, fields){
        if(error){
          console.log("Sql error: "+ error);
        }else{
          res.send("Deletado com sucesso");
        }
      });
    } 
  });
});

// Exposed api to create new debts and mask as dependent of month table  
app.post("/new/debts", function(req, res){
  var description = req.body.description;
  var due_date = req.body.due_date;
  var price = req.body.price;
  var paid = req.body.paid;
  var month_id = req.body.month_id;
  var query = "INSERT INTO debts (description, due_date, price, paid, month_id) VALUES (?, ?, ?, ?, ?)";
  con.query(query, [description, due_date, price, paid, month_id], function(error, results, fields){
    if(error){
      res.send("Não é permitido dívidas iguais");
    }else{
      res.send("Dívida criada com sucesso");
    }
  });
});

// Exposed api to edit debts based on its id 
app.post("/edit/debts/:id", function(req, res){
  var description = req.body.description;
  var due_date = req.body.due_date;
  var price = req.body.price;
  var paid = req.body.paid;
  var id = req.params.id;
  var query = "UPDATE debts SET description = ?, due_date = ?, price = ?, paid = ? WHERE id = ?;";
  con.query(query, [description, due_date, price, paid, id], function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.send("Dívida atualizada com sucesso");
    }
  });
});

// Exposed api to send debts bsade on the month 
app.post("/debts", function(req, res){
  var month_id = req.body.month_id;
  var query = "SELECT * FROM debts WHERE month_id = ?";
  con.query(query, month_id, function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.json(results);
    }
  });
});

// Exposed api to delete debts
app.post("/delete/debts/:id", function(req, res){
  var debt_id = req.params.id;
  var query = "DELETE FROM debts WHERE id = ?";
  con.query(query, debt_id, function(error, results, fields){
    if(error){
      console.log("Sql error: "+ error);
    }else{
      res.send("Deletado com sucesso");
    }
  });
});


// Start server to listen on port and ip
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Chat server listening at", process.env.IP + ":" + process.env.PORT);
});
