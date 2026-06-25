# wcup-event
worldcup event


```sql

CREATE TABLE public.tb_betting (
	id bigserial NOT NULL,
	sso_login_id varchar(20) NOT NULL,
	game_id int8 NOT NULL,
	betting varchar(1) NULL,
	create_by timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT tb_betting_pk PRIMARY KEY (id),
	CONSTRAINT uq_betting_user_game UNIQUE (sso_login_id, game_id)
);

CREATE TABLE public.tb_game (
	game_id bigserial NOT NULL,
	cont varchar(1000) NOT NULL,
	create_by timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	home varchar(200) NULL,
	away varchar(200) NULL,
	home_score varchar(2) NULL,
	away_score varchar(2) NULL,
	home_img varchar(255) NULL,
	away_img varchar(255) NULL,
	start_dt timestamp NULL,
	open_yn varchar(1) NULL,
	CONSTRAINT tb_game_pk PRIMARY KEY (game_id)
);


INSERT INTO public.tb_game (cont,create_by,home,away,home_score,away_score,home_img,away_img,start_dt,open_yn) VALUES
	 ('제3경기 2026-06-25(목) 대한민국 VS 남아공','2026-06-10 23:21:21.845188','대한민국','남아공',NULL,NULL,'flag-kor.png','flag-rsa.png','2026-06-25 10:00:00','N'),
	 ('제2경기 2026-06-19(금) 대한민국 VS 멕시코','2026-06-10 23:21:06.003721','대한민국','멕시코',NULL,NULL,'flag-kor.png','flag-mex.png','2026-06-19 10:00:00','Y'),
	 ('제1경기 2026-06-12(금) 대한민국 VS 체코','2026-06-10 23:20:45.464376','대한민국','체코','1','2','flag-kor.png','flag-cze.png','2026-06-12 10:00:00','N');


```
