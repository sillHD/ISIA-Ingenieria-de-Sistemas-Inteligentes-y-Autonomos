import assert from 'node:assert/strict'
import test from 'node:test'
import {permiteRobots} from '../lib/convocatorias/robots.ts'

const listado = 'https://investigacion.manizales.unal.edu.co/convocatorias/'

test('respeta una prohibición general del listado', () => {
 assert.equal(permiteRobots('User-agent: *\nDisallow: /convocatorias/', listado), false)
})

test('una excepción específica puede permitir el listado', () => {
 const reglas = 'User-agent: *\nDisallow: /\nAllow: /convocatorias/'
 assert.equal(permiteRobots(reglas, listado), true)
})

test('aplica primero las reglas del agente de ISIA', () => {
 const reglas = 'User-agent: *\nDisallow: /\n\nUser-agent: ISIA-Convocatorias\nAllow: /convocatorias/'
 assert.equal(permiteRobots(reglas, listado), true)
})
