#!/usr/bin/env node
const shell = require('shelljs')
const git = require('simple-git')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')
const spawn = require('cross-spawn')
const tree = require('tree-directory')
const program = require('commander')

const spinner = new Spinner({
    text: chalk.cyan('processing.. %s'),
    stream: process.stderr,
    onTick: function (msg) {
        this.clearLine(this.stream);
        this.stream.write(msg);
    }
})

program
    .option('-v, --version', 'Show version', version)
    .option('-h, --help', 'Show help', help)

program.command('new <dir>')
    .action(async (dir) => {
        try {
            console.log(chalk.green.bold(`Downloading repository into ${dir} `))
            spinner.start()
            await getReop(dir)
            spinner.stop()
            shell.cd(dir)
            console.log('')
            const res = await tree('./')
            console.log(chalk.green(res))
            await installPackages()
            console.log(chalk.green.bold('Done.\n '))
            console.log(chalk.green.bold(`Type cd ${dir} to enter to project folder.\n `))
        } catch (error) {
            console.log(chalk.red.bold(error))
        }
    })

program.parse(process.argv);

function getReop(projectName) {
    return new Promise((resolve, reject) => {
        try {
            git().clone(
                'https://github.com/daaif/slides.git',
                projectName,
                resolve
            )
        } catch (error) {
            reject(error)
        }
    })

}

function installPackages() {
    console.log(chalk.green.bold('Installing Dependencies\n'));
    return new Promise((resolve, reject) => {
        let command = 'npm'
        let args = ['install']

        const child = spawn(command, args, { stdio: 'inherit' })
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`
                });
            } else
                resolve()
        })
    })
}

function help() {
    console.log(chalk.green.bold('------------------------------------------------'))
    console.log(chalk.green.bold('> sp-slides -h : get this help'))
    console.log(chalk.green.bold('------------------------------------------------'))
    console.log(chalk.green.bold('> sp-slides -v : get sp-slides\'s version'))
    console.log(chalk.green.bold('------------------------------------------------'))
    console.log(chalk.green.bold('> sp-slides new <project> : create new project'))
    console.log(chalk.green.bold('> cd project '))
    console.log(chalk.green.bold('------------------------------------------------'))
}

function version() {
    try {
        const package = require('./package.json')
        console.log(chalk.green.bold(`version: ${package.version}\n`))
    } catch (error) {
        console.log(chalk.red.bold(error))
    }
}