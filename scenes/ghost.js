
export default function Ghost(main) {

    
    for(var i=1;i<=4;i++){
        main.anims.create({
            key: 'ghost'+ i +'Right',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:0, end:0}),
        
        });
        main.anims.create({
            key: 'ghost'+ i +'Left',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:1, end:1}),
            frameRate:5,

        });
        main.anims.create({
            key: 'ghost'+ i +'Down',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:2, end:2}),
            frameRate:5,

        });
        main.anims.create({
            key: 'ghost'+ i +'Up',
            frames: main.anims.generateFrameNumbers('ghost'+i,{start:3, end:3}),
            frameRate:5,
        });
    }

    main.anims.create({
        key: 'blueGhostRight',
        frames: main.anims.generateFrameNumbers('blueGhost',{start:0, end:0}),
    
    });
    main.anims.create({
        key: 'blueGhostLeft',
        frames: main.anims.generateFrameNumbers('blueGhost',{start:1, end:1}),
        frameRate:5,

    });
    main.anims.create({
        key: 'blueGhostDown',
        frames: main.anims.generateFrameNumbers('blueGhost',{start:2, end:2}),
        frameRate:5,

    });
    main.anims.create({
        key: 'blueGhostup',
        frames: main.anims.generateFrameNumbers('blueGhost',{start:3, end:3}),
        frameRate:5,
    });



    for(var i=0;i<=4;i++){
        main.anims.create({
            key: 'fruit'+ i,
            frames: main.anims.generateFrameNumbers('fruits',{start:i, end:i}),
        
        });
    }
}   
