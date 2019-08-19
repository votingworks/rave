/* eslint-disable cypress/no-unnecessary-waiting */
describe('Scroll Buttons', () => {
  it('Scroll buttons appear and function correctly', () => {
    cy.visit('/#sample')
    cy.contains('Get Started').click()
    cy.contains('Start Voting').click()
    cy.contains('Next').click()
    cy.wait(250)
    cy.contains('Next').click()
    cy.wait(250)
    cy.contains('Brad Plunkard').should('be.visible')
    cy.queryByText('↑ See More', { timeout: 0 }).should('not.be.visible')
    cy.queryByText('↓ See More', { timeout: 0 }).should('not.be.visible')
    cy.contains('Next').click()
    cy.wait(250)
    cy.get('button').should('have.length', 26 + 5) // 26 candidates + 5 UI
    cy.contains('Charlene Franz').should('be.visible')
    cy.contains('↑ See More').should('be.disabled')
    cy.contains('↓ See More').click()
    cy.wait(250)
    cy.contains('Charlene Franz', { timeout: 0 }).should('not.be.visible')
    cy.contains('↓ See More').click()
    cy.wait(250)
    cy.contains('↓ See More').click()
    cy.wait(250)
    cy.contains('↓ See More').click()
    cy.wait(250)
    cy.contains('↓ See More').click()
    cy.wait(250)
    cy.contains('Glenn Chandler').should('be.visible')
    cy.contains('↓ See More').should('be.disabled')
    cy.contains('↑ See More').click()
    cy.wait(250)
    cy.contains('↑ See More').click()
    cy.wait(250)
    cy.contains('↑ See More').click()
    cy.wait(250)
    cy.contains('↑ See More').click()
    cy.wait(250)
    cy.contains('↑ See More').click()
    cy.wait(250)
    cy.contains('Charlene Franz').should('be.visible')
  })

  it('Scroll buttons do not appear on smaller screens', () => {
    cy.viewport(375, 812) // iPhoneX
    cy.visit('/#sample')
    cy.contains('Get Started').click()
    cy.contains('Start Voting').click()
    cy.contains('Next').click()
    cy.wait(250)
    cy.queryByText('↓ See More', { timeout: 0 }).should('not.be.visible')
    cy.contains('Next').click()
    cy.wait(250)
    cy.queryByText('↓ See More', { timeout: 0 }).should('not.be.visible')
    cy.contains('Next').click()
    cy.wait(250)
    cy.get('button').should('have.length', 26 + 3) // 26 candidates + 3 UI
    cy.queryByText('↓ See More', { timeout: 0 }).should('not.be.visible')
  })
})
