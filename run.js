(() => {
    /**
     *  A note on process I/O#
        process.stdout and process.stderr 与 Node.js 中其他 streams 在重要的方面有不同:

        他们分别使用内部的 console.log() 和 console.error()。
        他们不能被关闭 (调用end()将会抛出异常)。
        他们永远不会触发 'finish' 事件。
        写操作是否为同步，取决于连接的是什么流以及操作系统是 Windows 还是 POSIX :

        Files: 同步 在 Windows 和 POSIX 下
        TTYs (Terminals): 异步 在 Windows 下， 同步 在 POSIX 下
        Pipes (and sockets): 同步 在 Windows 下， 异步 在 POSIX 下
        这些行为部分是历史原因，改变他们可能导致向后不兼容，而且他们的行为也符合部分用户的预期。

        Tips:
        警告: 同步写将会阻塞事件循环直到写完成。 有时可能一瞬间就能写到一个文件，
        但当系统处于高负载时，管道的接收端可能不会被读取、缓慢的终端或文件系统，
        因为事件循环被阻塞的足够频繁且足够长的时间，这些可能会给系统性能带来消极的影响。
        当你向一个交互终端会话写时这可能不是个问题，但当生产日志到进程的输出流时要特别留心。

     */

    // const childProcess = require('child_process');
    const runSpider = require('./lib/spiderBook');
    const logger = require('./lib/logger');

    let isRun = false, params;


    process.stdout.write('\r\n"Please refer to the parameters" eg:1-1-1 { baseNumber-concurrent-granularity } \r\n');
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        const chunk = process.stdin.read();
        if (isRun || !chunk) return;
        if ((chunk.indexOf('y') >= 0 || chunk.indexOf('Y') >= 0) && !!params) {
            isRun = true;
            process.stdout.write('running...\r\n');
            runSpider(params[0], params[1], params[2]);
            // childProcess.exec('node runSpider');
            logger('Run spider | ' + params, 'log');
            return;
        }
        
       if(chunk.indexOf('n') >= 0 || chunk.indexOf('N') >= 0){
            process.abort();
            return;
       }
       
       if (chunk !== null) {
            let arr = [];
            chunk.split('-').forEach(item => {
                item = parseInt(item);
                if(item>0) {
                    arr.push(item);
                }
            });

            if (arr.length >= 3) {
                params = arr;
                process.stdout.write('enter y run or enter n cancel: \r\n');
            } else {
                process.stdout.write('param error! please try again! \r\n');
            }
        }
    });

    process.stdin.on('end', () => {
        process.stdout.write('end');
    });
})()