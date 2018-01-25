-- drop table users;
-- drop table months;
-- drop table debts;
create table users (id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
                    username varchar(50) NOT NULL,
                    password varchar(50) NOT NULL,
                    UNIQUE (username)
                    );
                    
create table months (id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
                    month_date DATE NOT NULL,
                    user_id int NOT NULL,
                    UNIQUE (month_date, user_id)
                    );
                    
create table debts (id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
                    description varchar(50) NOT NULL,
                    due_date DATE NOT NULL,
                    price FLOAT NOT NULL,
                    paid int NOT NULL,
                    month_id int NOT NULL,
                    UNIQUE (description, month_id)
                    );
                    
-- select * from  debts;