
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    this.player;
    this.cursors;
    this.flowers;
    this.timeleft;

    this.scoreText = "Pollen Count: ";
    this.scoreLabel;

    this.hiveText = "Hive Count: ";
    this.scoreLabelHive;

    this.timeText = "Time: ";
    this.timeLabel;

    this.replayLabel;

    // Static Vars
    this.playerGravity = 800;
     // flap thrust
    this.playerFlapPower = 300;
    this.pollenMax = 100;
    this.timeMax = 60;
};

BasicGame.Game.prototype = {

    create: function () {

        //  World settings
        this.game.stage.backgroundColor = "#70d0f6";
        this.game.world.setBounds(0, 0, 1920, 480);
        this.timeleft = this.timeMax;
        this.game.time.reset();

        var bg1 = this.game.add.sprite(0, 64, 'bg1');
        var bg2 = this.game.add.sprite(768, 64, 'bg1');
        var bg3 = this.game.add.sprite(1535, 64, 'bg1');
        bg2.anchor.x = 1;
        bg2.scale.x = -1;


        // Score Labels
        var style = { font: "24px Arial", fill: "#000000", align: "center" };
        this.scoreLabel = this.game.add.text(10, 0, this.scoreText, style);
        this.scoreLabel.fixedToCamera = true;
        this.scoreLabelHive = this.game.add.text(300, 0, this.hiveText, style);
        this.scoreLabelHive.fixedToCamera = true;
        this.timeLabel = this.game.add.text(600, 0, this.timeText, style);
        this.timeLabel.fixedToCamera = true;

        // Set up flowers
        this.flowers = this.game.add.physicsGroup();
        //this.flowers.create(500, 150, 'flower1');
        var stem1 = this.game.add.sprite(385, 340, 'stem');
        stem1.moveDown();
        var daisy1 = this.flowers.create(400, 250, 'daisy');
        daisy1.frame = 0;
        
        var stem2 = this.game.add.sprite(635, 380, 'stem');
        stem2.moveDown();
        var daisy2 = this.flowers.create(650, 300, 'daisy');
        daisy2.frame = 1;

        var stem3 = this.game.add.sprite(835, 330, 'stem');
        stem3.moveDown();
        var daisy3 = this.flowers.create(850, 250, 'daisy');
        daisy3.frame = 2;

        var stem4 = this.game.add.sprite(1085, 300, 'stem');
        stem4.moveDown();
        var stem4b = this.game.add.sprite(1085, 420, 'stem');
        var daisy4 = this.flowers.create(1100, 200, 'daisy');
        daisy4.frame = 3;

        var stem5 = this.game.add.sprite(1385, 380, 'stem');
        stem5.moveDown(); stem5.moveDown(); stem5.moveDown();
        var daisy5 = this.flowers.create(1400, 300, 'daisy');
        daisy5.frame = 0;

        var stem6 = this.game.add.sprite(1635, 330, 'stem');
        stem6.moveDown(); stem6.moveDown(); stem6.moveDown();
        var daisy6 = this.flowers.create(1650, 250, 'daisy');
        daisy6.frame = 1;

        this.flowers.setAll('body.immovable', true);
        //this.flowers.moveUp();

        // end flowers

        this.hives = this.game.add.physicsGroup();
        this.hives.create(-30, 200, 'hive1');
        this.hives.setAll('body.immovable', true);

        // Player Init
        this.player = this.game.add.sprite(96, 200, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = this.playerGravity;
        this.player.body.collideWorldBounds = true;
        this.player.z = 50;
        this.player.pollen = 0;

        // Camera setup
        this.game.camera.follow(this.player);
        this.game.camera.deadzone = new Phaser.Rectangle(100, 100, 568, 480);

        // Collision Checks
        this.flowers.forEach(this.pollenInit, this);
        this.hives.forEach(this.pollenInitHive, this);
        

        // Controls
        this.game.input.onDown.add(this.playerFlap, this);
        this.game.input.onDown.add(this.unpause, this);

        this.cursors = this.game.input.keyboard.createCursorKeys();

    },

    update: function () {

        // Controls
        if (this.cursors.left.isDown)
        {
            // LEFT
            this.player.body.velocity.x = -250;
            this.player.scale.x = -1;
        }
        else if (this.cursors.right.isDown)
        {
            // RIGHT
            this.player.body.velocity.x = 250;
            this.player.scale.x = 1;
        }

        // Collision Checks
        this.flowers.forEach(this.checkFlowerOverlap, this);
        this.hives.forEach(this.checkHiveOverlap, this);
        
        // Score Updates
        this.flowers.forEach(this.pollenGet, this);
        this.flowers.forEach(this.pollenIncrease, this);

        this.hives.forEach(this.pollenGetHive, this);

        console.log('player pollen', this.player.pollen);

        this.scoreLabel.setText( this.scoreText + parseInt(this.player.pollen) );
        
        var timeleftDiff = parseInt( this.timeleft - this.game.time.totalElapsedSeconds() );
        this.timeLabel.setText( this.timeText + timeleftDiff );

        // End Game State
        if(this.player.y >= this.game.height-this.player.height*0.5){
            this.dieLow();
        } else if( parseInt(timeleftDiff) <= 0 ){
            this.dieTime();
        }
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    playerFlap: function() {

        this.player.body.velocity.y = -this.playerFlapPower;  

    },

    checkOverlap: function(spriteA, spriteB) {

        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);

    },

    checkFlowerOverlap: function(item) {
        if(this.checkOverlap(this.player, item)){
            console.log('hit');
            this.pollenDecrease(item);
        }
        return this.checkOverlap(this.player, item);

    },

    checkHiveOverlap: function(item) {
        if(this.checkOverlap(this.player, item)){
            this.pollenIncreaseHive(item);
        }
        return this.checkOverlap(this.player, item);

    },

    pollenInit: function(item){
        item.pollen = 100;
        item.active = true;
    },
    pollenGet: function(item){
        return item.pollen;
    },
    pollenDecrease: function(item){
        if(item.active){
            if(item.pollen > 0){
                item.pollen -= 0.5;
            } else if( item.pollen < 0 ){
                item.pollen = 0;
            }
            if(item.pollen == 0){
                item.active = false;
            }
            item.alpha = item.pollen/100;

            if(this.player.pollen < 100){
                this.player.pollen = this.pollenMax - item.pollen;
            }
            if(this.player.pollen >= 100){
                this.player.pollen = 100;
            }
        }
    },
    pollenIncrease: function(item){
        if(item.active){
            if(item.pollen < 100){
                item.pollen += 0.1;
            } else if( item.pollen > 100 ){
                item.pollen = 100;
            }
            /*
            if(item.pollen == 100){
                item.active = true;
            } */
            item.alpha = item.pollen/100;
        }
    },
    pollenInitHive: function(item){
        item.pollen = 0;
    },
    pollenGetHive: function(item){
        this.scoreLabelHive.setText( this.hiveText + parseInt(item.pollen/100) );
        return item.pollen;
    },
    pollenIncreaseHive: function(item){
        if(this.player.pollen > 0){
            item.pollen += 0.5;
            this.player.pollen -= 0.5;
        }

        if(this.player.pollen < 0){
            this.player.pollen = 0;
        }
    },


    alphaFade: function(item) {

        // Update alpha first.
        item.alpha -= item.alphaIncSpeed;

        // Check for switch between increasing and descreasing.
        if (item.alpha < 0.001 || item.alpha > 0.999)
        {
            item.alphaIncSpeed *= -1;
        }

    },

    unpause: function(){
        if(this.game.paused){
            this.game.paused = false;
            this.game.state.start("Game");
        }
    },

    dieTime: function(){
        // Create a label to use as a button
        var time_label = this.game.add.text(300, 50, 'TIMES UP!', { font: '34px Arial', fill: '#000' });
        time_label.fixedToCamera = true;
        this.die();
    },

    dieLow: function(){
        if(this.player.y >= this.game.height-this.player.height*0.5){
            this.player.scale.y = -1;
        }
        this.die();
    },

    die: function(){
        //localStorage.setItem("topFlappyScore",Math.max(score,topScore));
        
        this.game.paused = true;


        // Create a label to use as a button
        this.replayLabel = this.game.add.text(250, 150, 'Click to play again.', { font: '30px Arial', fill: '#000' });
        this.replayLabel.fixedToCamera = true;

        //this.replayLabel.events.onInputDown.add(this.unpause, this);

    }


};
