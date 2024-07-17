#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';

let exit = false;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
    const welcome = "Country App";

    const figletPromise = new Promise((resolve, reject) => {
        figlet(welcome, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log(gradient('red', 'orange', 'yellow').multiline(data));
                resolve();
            }
        });
    });

    await figletPromise;
}

async function askCountry() {
    console.log();

    const answers = await inquirer.prompt({
        name: 'country',
        type: 'input',
        message: 'What country would you like to know more about? (type "exit" to quit)',
        default() {
            return 'United States';
        },
    });

    if (answers.country.toLowerCase() === 'exit') {
        exit = true;
        let goodbye = chalkAnimation.rainbow('\nGoodbye!');
        await sleep(1000);
        goodbye.stop();
        return;
    }

    await handleAnswer(answers.country);
}

async function handleAnswer(country) {
    console.log();
    const spinner = createSpinner(`Fetching data for: ${country.toUpperCase()}...`).start();
    await sleep();
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`);

        if (!response.ok) {
            throw new Error(`Country not found: ${country.toUpperCase()}`);
        }

        spinner.success({ text: `Found data for: ${country.toUpperCase()}!\n` });

        const data = await response.json();

        await displayCountryData(data[0]);
    }
    catch (error) {
        spinner.error({ text: error.message });
        await sleep();
        await askCountry();
    }
}

async function displayCountryData(data) {
    console.log(chalk.bold(`${data.name.common} Information:\n`));
    console.log(chalk.green(`  Region: ${data.region}`));
    console.log(chalk.yellow(`  Capital: ${data.capital}`));
    console.log(chalk.blue(`  Population: ${data.population}`));
    
    const languages = data.languages ? Object.values(data.languages) : [];
    if (languages.length > 0) {
        console.log(chalk.magenta(`  Language: ${languages[0]}`));
    } else {
        console.log(chalk.red(`  Language: Not available`));
    }

    const currency = data.currencies ? Object.values(data.currencies)[0].name : [];
    if (currency.length > 0) {
        console.log(chalk.cyan(`  Currency: ${currency}`));
    } 
    else {
        console.log(chalk.red(`  Currency: Not available`));
    }

    await askCountry();
}

await welcome();
while (!exit) {
    await askCountry();
}